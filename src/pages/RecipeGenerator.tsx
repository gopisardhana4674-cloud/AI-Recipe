import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Plus, X, Mic, MicOff, Camera, Sparkles, AlertCircle, ArrowRight, Hourglass } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { useSpeech } from '../hooks/useSpeech';
import { useOCR } from '../hooks/useOCR';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { RecipeCardSkeleton } from '../components/ui/Skeleton';

const STAPLES = [
  'chicken', 'onion', 'garlic', 'tomato', 'potato', 'cheese', 'rice', 'pasta', 'eggs', 'milk', 'olive oil', 'butter'
];

const CUISINES = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'French'];
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Dairy-Free', 'Low-Carb'];
const ALLERGENS = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Shellfish'];

export default function RecipeGenerator() {
  const navigate = useNavigate();
  const {
    availableIngredients,
    generatedRecipes,
    isGenerating,
    error,
    addIngredient,
    removeIngredient,
    clearIngredients,
    generateRecipes,
  } = useRecipeStore();

  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeech();
  const { scanReceipt, isScanning, error: ocrError } = useOCR();

  const [ingredientInput, setIngredientInput] = useState('');
  const [requiredDish, setRequiredDish] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [servings, setServings] = useState(2);
  const [maxTime, setMaxTime] = useState(60);

  // Sync voice transcript to ingredients list when updated
  useEffect(() => {
    if (transcript) {
      // Split by common separators (e.g. "and", ",", " ")
      const parts = transcript.split(/,|and|\b\s+\b/i).map((p) => p.trim()).filter((p) => p.length > 1);
      parts.forEach((p) => addIngredient(p));
    }
  }, [transcript, addIngredient]);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientInput.trim()) {
      addIngredient(ingredientInput);
      setIngredientInput('');
    }
  };

  const handleOCRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await scanReceipt(file);
    }
  };

  const handleAllergenToggle = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleGenerate = async () => {
    await generateRecipes({
      cuisine: selectedCuisine || undefined,
      diet: selectedDiet || undefined,
      allergy: selectedAllergens.join(', ') || undefined,
      difficulty,
      servings,
      maxTime,
      requiredDish: requiredDish.trim() || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT 2 COLUMNS: Ingredients & Configuration controls */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        {/* Ingredient input and management */}
        <Card className="border-white/[0.05]">
          <CardHeader className="flex justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <ChefHat size={18} className="text-orange-400" />
              <h2 className="text-base font-bold text-white">Enter Available Ingredients</h2>
            </div>
            {availableIngredients.length > 0 && (
              <button
                onClick={clearIngredients}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </CardHeader>
          <CardBody className="flex flex-col gap-6">
            {/* Target Dish Input */}
            <div className="flex flex-col gap-2 pb-2 border-b border-white/[0.05]">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Target Dish / Keyword (Optional)</label>
              <Input
                placeholder="What dish do you want to make? (e.g. Chocolate Cake, Pizza, Lasagna)"
                value={requiredDish}
                onChange={(e) => setRequiredDish(e.target.value)}
                className="w-full bg-white/[0.02]"
              />
            </div>

            {/* Input fields */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Add Pantry Ingredients</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={handleAddIngredient} className="flex-1">
                  <Input
                    placeholder="Type an ingredient (e.g. Garlic, Chicken, Pasta)"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    className="flex-1"
                  />
                </form>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleAddIngredient} className="flex-1 sm:flex-none">
                    <Plus size={16} className="mr-1" />
                    Add
                  </Button>
                  
                  {/* Voice input button */}
                  <Button
                    variant={isListening ? 'danger' : 'secondary'}
                    onClick={isListening ? stopListening : startListening}
                    title="Speak ingredients"
                    className="px-3"
                  >
                    {isListening ? <MicOff size={16} className="text-red-400 animate-pulse" /> : <Mic size={16} />}
                  </Button>

                  {/* OCR Receipt Upload Scanner */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isScanning}
                    />
                    <Button variant="secondary" loading={isScanning} title="Scan Receipt Image" className="px-3">
                      {!isScanning && <Camera size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Indicators (OCR / Speech) */}
            {(speechError || ocrError) && (
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{speechError || ocrError}</span>
              </div>
            )}

            {/* Ingredient Badges rendering */}
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-3">Your Kitchen Pantry</span>
              {availableIngredients.length === 0 ? (
                <div className="py-6 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500 font-medium">
                  Your pantry is empty. Use inputs above or select staples below to get started!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {availableIngredients.map((ing) => (
                      <motion.span
                        key={ing}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold capitalize"
                      >
                        <span>{ing}</span>
                        <button
                          onClick={() => removeIngredient(ing)}
                          className="hover:text-white transition-colors cursor-pointer ml-1"
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Pantry Staples List */}
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase block mb-3">Pantry Staples (Quick Add)</span>
              <div className="flex flex-wrap gap-2">
                {STAPLES.map((staple) => {
                  const hasIt = availableIngredients.includes(staple);
                  return (
                    <button
                      key={staple}
                      onClick={() => (hasIt ? removeIngredient(staple) : addIngredient(staple))}
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold transition-all border capitalize cursor-pointer
                        ${hasIt
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-white/[0.01] hover:bg-white/[0.04] text-gray-400 border-white/[0.05] hover:border-white/[0.1]'
                        }
                      `}
                    >
                      {staple}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recipe customization panel */}
        <Card className="border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-orange-400" />
              <h2 className="text-base font-bold text-white">Dietary & Style Customization</h2>
            </div>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cuisine style selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Cuisine Style</label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white outline-none backdrop-blur-md transition-all cursor-pointer"
              >
                <option value="">Any Cuisine</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c} className="bg-gray-950">{c}</option>
                ))}
              </select>
            </div>

            {/* Dietary preferences selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Dietary Plan</label>
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white outline-none backdrop-blur-md transition-all cursor-pointer"
              >
                <option value="">No Restrictions</option>
                {DIETS.map((d) => (
                  <option key={d} value={d} className="bg-gray-950">{d}</option>
                ))}
              </select>
            </div>

            {/* Servings count select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Servings Count</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 4, 6, 8].map((s) => (
                  <button
                    key={s}
                    onClick={() => setServings(s)}
                    className={`
                      py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer
                      ${servings === s
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-white/[0.01] text-gray-400 border-white/[0.05] hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`
                      py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer
                      ${difficulty === d
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        : 'bg-white/[0.01] text-gray-400 border-white/[0.05] hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Cooking Time range */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Max Cooking Time</label>
                <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                  <Hourglass size={14} />
                  {maxTime} minutes
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
              />
            </div>

            {/* Allergen exclusions list */}
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Exclude Allergens</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((allergen) => {
                  const active = selectedAllergens.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      onClick={() => handleAllergenToggle(allergen)}
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer
                        ${active
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-white/[0.01] text-gray-400 border-white/[0.05] hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Generate Trigger Button */}
        <Button
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={availableIngredients.length === 0}
          size="lg"
          className="w-full text-base font-extrabold shadow-lg shadow-orange-500/15 py-4"
        >
          <Sparkles size={18} className="mr-2" />
          <span>Cook up generated recipes</span>
        </Button>
      </div>

      {/* RIGHT COLUMN: AI Generation outputs */}
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <span>Cooking Outputs</span>
          {generatedRecipes.length > 0 && (
            <span className="text-[10px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">
              {generatedRecipes.length} Ready
            </span>
          )}
        </h3>

        {/* Loading status */}
        {isGenerating && (
          <div className="flex flex-col gap-6">
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </div>
        )}

        {/* Error notification */}
        {error && !isGenerating && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-semibold text-center flex flex-col gap-2">
            <AlertCircle size={20} className="mx-auto text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty placeholder */}
        {!isGenerating && !error && generatedRecipes.length === 0 && (
          <div className="py-20 border border-dashed border-white/10 rounded-3xl text-center text-gray-500 font-medium px-6 flex flex-col items-center gap-4 justify-center h-full">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex items-center justify-center text-gray-600">
              <ChefHat size={32} />
            </div>
            <div className="flex flex-col gap-1 max-w-xs">
              <span className="text-sm font-bold text-white">No Recipes Generated Yet</span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Add ingredients and customize your parameters on the left, then click "Cook up generated recipes".
              </p>
            </div>
          </div>
        )}

        {/* Render Generated Recipe Cards */}
        {!isGenerating && !error && generatedRecipes.length > 0 && (
          <div className="flex flex-col gap-6">
            {generatedRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => {
                  useRecipeStore.setState({ activeRecipe: recipe });
                  // If id is absent (generated but not saved), we pass index as parameter or store reference
                  navigate(`/recipe/generated_${index}`);
                }}
                className="group cursor-pointer"
              >
                <Card className="border-white/[0.06] hover:border-orange-500/20">
                  <div className="relative h-44 w-full overflow-hidden border-b border-white/[0.05]">
                    <img
                      src={recipe.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop&q=80'}
                      alt={recipe.title}
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 border border-white/10 text-[10px] font-bold text-gray-300">
                      ⏱ {recipe.cookTime}
                    </div>
                  </div>
                  <CardBody className="p-5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{recipe.cuisine}</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">🟢 {recipe.difficulty}</span>
                    </div>
                    <h4 className="text-base font-extrabold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                      {recipe.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.05]">
                      <span className="text-[10px] text-gray-500 font-bold">
                        {recipe.ingredients.filter(i => !i.isMissing).length} / {recipe.ingredients.length} items in pantry
                      </span>
                      <span className="text-xs font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Cook recipe
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
