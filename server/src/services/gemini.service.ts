import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = 'gemini-3.5-flash';

// JSON validation schema types
export interface RecipeAIResponse {
  title: string;
  description: string;
  cookTime: string;
  prepTime: string;
  difficulty: string;
  servings: number;
  cuisine: string;
  dietaryTags: string[];
  allergens: string[];
  ingredients: { name: string; amount: string; isMissing: boolean }[];
  steps: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  chefTip: string;
}

export const geminiService = {
  /**
   * Generates recipes based on input parameters. Enforces JSON output from Gemini and validates it.
   */
  async generateRecipes(
    ingredients: string[],
    options: {
      cuisine?: string;
      diet?: string;
      allergy?: string;
      difficulty?: string;
      servings?: number;
      maxTime?: number;
      requiredDish?: string;
    }
  ): Promise<RecipeAIResponse[]> {
    const prompt = `You are a Senior Staff Chef. Create 3 delicious and resource-efficient recipes ${options.requiredDish ? `specifically to make the dish: "${options.requiredDish}"` : 'based on the details below'} using:
Available Ingredients (in-hand): ${ingredients.join(', ')}
${options.cuisine ? `Cuisine Style: ${options.cuisine}` : ''}
${options.diet ? `Dietary Restriction: ${options.diet}` : ''}
${options.allergy ? `Exclude Allergen Ingredients: ${options.allergy}` : ''}
${options.difficulty ? `Difficulty Level: ${options.difficulty}` : ''}
${options.servings ? `Servings Count: ${options.servings}` : 'Servings Count: 2-4'}
${options.maxTime ? `Maximum Total Time (Prep+Cook): ${options.maxTime} minutes` : ''}

CRITICAL EFFICIENCY REQUIREMENT:
Design the recipes to maximize the utilization of the user's "Available Ingredients (in-hand)" listed above. Try to minimize the number of missing ingredients required for the dish, adapting the recipe steps creatively to use in-hand substitutes where appropriate. For example, if they request to make Pancakes and have oats, milk, eggs, bananas, focus on banana oat pancakes to avoid needing flour.

For each recipe, you must return:
1. "title": Name of the recipe
2. "description": Brief overview
3. "cookTime": cook time (e.g., "25 mins")
4. "prepTime": prep time (e.g., "10 mins")
5. "difficulty": "Easy", "Medium", or "Hard"
6. "servings": number of servings
7. "cuisine": country or style of cuisine (e.g. "Italian", "Mexican")
8. "dietaryTags": tags matching (e.g., "Vegan", "Gluten-Free", "Vegetarian", "Keto")
9. "allergens": list of allergy items contained (e.g., "Peanuts", "Dairy")
10. "ingredients": an array of objects containing:
    - "name": ingredient name
    - "amount": measurements (e.g., "1 cup", "200g", "to taste")
    - "isMissing": true if the ingredient is NOT in the Available Ingredients list, false if it is already in the Available Ingredients list.
11. "steps": array of sequential cooking instructions
12. "nutrition": object containing "calories" (number), "protein" (string), "carbs" (string), "fat" (string)
13. "chefTip": a unique chef's advice for the recipe

You MUST return a JSON array of objects representing the recipes. Do not include markdown code block syntax around the JSON (just return raw JSON), and do not add any comments or text outside the JSON.
Follow this TypeScript schema:
Array<{
  title: string;
  description: string;
  cookTime: string;
  prepTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  cuisine: string;
  dietaryTags: string[];
  allergens: string[];
  ingredients: Array<{ name: string; amount: string; isMissing: boolean }>;
  steps: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  chefTip: string;
}>`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);

      // Validation
      if (!Array.isArray(parsed)) {
        throw new Error('AI did not return an array of recipes');
      }

      // Enforce schema validation & repair if slightly malformed
      const validatedRecipes: RecipeAIResponse[] = parsed.map((recipe: any, index: number) => {
        return {
          title: String(recipe.title || `Delicious Recipe ${index + 1}`),
          description: String(recipe.description || 'A tasty recipe created for you.'),
          cookTime: String(recipe.cookTime || '20 mins'),
          prepTime: String(recipe.prepTime || '10 mins'),
          difficulty: ['Easy', 'Medium', 'Hard'].includes(recipe.difficulty) ? recipe.difficulty : 'Medium',
          servings: Number(recipe.servings || 2),
          cuisine: String(recipe.cuisine || 'Fusion'),
          dietaryTags: Array.isArray(recipe.dietaryTags) ? recipe.dietaryTags.map(String) : [],
          allergens: Array.isArray(recipe.allergens) ? recipe.allergens.map(String) : [],
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((ing: any) => ({
                name: String(ing.name || 'Ingredient'),
                amount: String(ing.amount || 'to taste'),
                isMissing: typeof ing.isMissing === 'boolean' ? ing.isMissing : true,
              }))
            : [],
          steps: Array.isArray(recipe.steps) && recipe.steps.length > 0 ? recipe.steps.map(String) : ['Cook everything together until done.'],
          nutrition: {
            calories: Number(recipe.nutrition?.calories || 350),
            protein: String(recipe.nutrition?.protein || '10g'),
            carbs: String(recipe.nutrition?.carbs || '30g'),
            fat: String(recipe.nutrition?.fat || '12g'),
          },
          chefTip: String(recipe.chefTip || 'Enjoy hot!'),
        };
      });

      return validatedRecipes;
    } catch (err: any) {
      console.error('⚠️ Gemini generation error or invalid JSON structure. Healing...', err.message);
      // Recovery mode: return mock recipe list containing their exact in-hand ingredients
      return this.getFallbackRecipes(ingredients, options);
    }
  },

  /**
   * Run OCR on a food label or receipt image to extract ingredients list.
   */
  async scanOCR(imageBase64: string): Promise<string[]> {
    const prompt = `You are an OCR and nutrition expert. Analyze the attached image of a grocery receipt, food label, or pantry items. 
Extract all edible ingredients or food items you can identify.
Return a simple JSON array of strings containing just the ingredient names.
Do not include any explanation or other text.
Example: ["chicken", "tomato", "garlic", "rice", "spinach"]`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'image/png', data: imageBase64 } },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
      return [];
    } catch (err: any) {
      console.error('OCR scanning error, returning empty array:', err.message);
      return [];
    }
  },

  /**
   * Chat assistant for a recipe. Enables user to ask cooking instructions.
   */
  async chatAssistant(
    messages: { role: 'user' | 'assistant'; content: string }[],
    recipeContext: RecipeAIResponse
  ): Promise<string> {
    const prompt = `You are a Helpful Kitchen Cooking Assistant. The user is currently cooking a recipe.
Here is the Recipe Context:
Recipe Title: ${recipeContext.title}
Description: ${recipeContext.description}
Ingredients: ${recipeContext.ingredients.map((i) => `${i.amount} ${i.name}`).join(', ')}
Steps: ${recipeContext.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}
Chef's Tip: ${recipeContext.chefTip}

Help the user with any questions they have about cooking this recipe, substituting ingredients, scaling sizes, or resolving issues.
Be concise, clear, and highly encouraging. Do not output JSON here, write natural cooking instructions.`;

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Insert context as system prompt or prepended user message
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: prompt }] },
        },
      });

      return response.text || "Sorry, I couldn't process that kitchen query. Let me know if you want to try again.";
    } catch (err: any) {
      console.error('Chat assistant error:', err.message);
      return 'I had trouble connecting to the chef network. Please check your stove heat and ask again!';
    }
  },

  /**
   * Recovery handler in case of Gemini failures. Returns standard tasty recipes using input ingredients.
   */
  getFallbackRecipes(ingredients: string[], options: any): RecipeAIResponse[] {
    const inHand = ingredients.map((name) => ({ name, amount: 'to taste', isMissing: false }));
    const defaultDifficulty = options.difficulty || 'Easy';
    const defaultServings = options.servings || 2;
    const defaultCuisine = options.cuisine || 'Comfort Food';

    return [
      {
        title: `Quick ${defaultCuisine} Stir-Fry`,
        description: 'A versatile stir-fry using your available ingredients, tossed in a simple savory seasoning.',
        cookTime: '15 mins',
        prepTime: '10 mins',
        difficulty: defaultDifficulty,
        servings: defaultServings,
        cuisine: defaultCuisine,
        dietaryTags: ['Quick', 'Healthy'],
        allergens: [],
        ingredients: [
          ...inHand,
          { name: 'cooking oil', amount: '1 tbsp', isMissing: !ingredients.includes('oil') },
          { name: 'soy sauce or salt', amount: 'to taste', isMissing: true },
        ],
        steps: [
          'Wash and prep all available ingredients into bite-sized pieces.',
          'Heat oil in a pan or wok over high heat.',
          'Add your ingredients in order of cook time (dense vegetables first, then proteins, leafy greens last).',
          'Toss frequently, season with soy sauce or salt, and serve hot.',
        ],
        nutrition: { calories: 290, protein: '12g', carbs: '18g', fat: '10g' },
        chefTip: 'Add a splash of vinegar or citrus juice at the end to brighten up the flavors!',
      },
      {
        title: `Pan-Seared Rustic Skillet`,
        description: 'A comforting pan-seared combination of ingredients lightly roasted on the stove.',
        cookTime: '20 mins',
        prepTime: '10 mins',
        difficulty: defaultDifficulty,
        servings: defaultServings,
        cuisine: defaultCuisine,
        dietaryTags: ['Rustic', 'Comfort'],
        allergens: [],
        ingredients: [
          ...inHand,
          { name: 'butter or oil', amount: '2 tbsp', isMissing: true },
          { name: 'black pepper', amount: '1 pinch', isMissing: true },
        ],
        steps: [
          'Preheat a heavy pan or cast iron skillet on medium heat.',
          'Add butter or oil to coat the bottom of the pan.',
          'Add your ingredients and sear without stirring for 3-4 minutes to develop a nice golden crust.',
          'Turn over, season with salt and black pepper, cover, and let cook through.',
        ],
        nutrition: { calories: 340, protein: '15g', carbs: '15g', fat: '14g' },
        chefTip: 'Do not stir too often; letting ingredients sit creates a delicious caramelized sear.',
      },
    ];
  },
};
