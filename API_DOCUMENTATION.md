# Kitchen AI - API Documentation

The Kitchen AI backend is a RESTful API written in Node.js, Express, and TypeScript. It features Helmet security headers, Express Rate Limiting, JSON body limits, and dual-mode database support.

## Base URL
`/api`

## Content-Type
`application/json`

---

## Authentication Middleware
API routes are protected by the `requireAuth` middleware. Authenticate requests by passing a Bearer token:
```
Authorization: Bearer <clerk_token_or_mock_token>
```
*If running in local Mock Mode, you can pass custom mock headers to identify the caller session directly:*
- `x-mock-user-id`: Identifies the mock user session.
- `x-mock-user-email`: Email of the mock user session.
- `x-mock-user-name`: Display name of the mock user session.

---

## Endpoints

### 1. User Sync & Profile

#### `POST /users/sync`
Syncs the Clerk or Mock authenticated user details with the database.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "message": "User sync successful",
    "user": {
      "id": "mock_user_abc",
      "email": "user@example.com",
      "name": "Jane Cook",
      "avatarUrl": "https://api.dicebear.com/...",
      "createdAt": "2026-07-10T12:00:00Z"
    }
  }
  ```

#### `GET /users/profile`
Retrieves the logged-in user profile details.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "profile": {
      "id": "mock_user_abc",
      "email": "user@example.com",
      "name": "Jane Cook"
    }
  }
  ```

---

### 2. Recipes & Generative AI

#### `POST /recipes/generate`
Generates 3 customized recipes matching available pantry items using Gemini AI.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "ingredients": ["chicken", "onion", "garlic", "cream"],
    "cuisine": "Italian",
    "diet": "Keto",
    "allergy": "Peanuts",
    "difficulty": "Easy",
    "servings": 2,
    "maxTime": 45
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "recipes": [
      {
        "title": "Creamy Garlic Garlic Chicken",
        "description": "Succulent chicken breasts cooked in a rich onion and garlic cream reduction.",
        "cookTime": "25 mins",
        "prepTime": "10 mins",
        "difficulty": "Easy",
        "servings": 2,
        "cuisine": "Italian",
        "dietaryTags": ["Keto", "Gluten-Free"],
        "allergens": [],
        "ingredients": [
          { "name": "chicken", "amount": "400g", "isMissing": false },
          { "name": "onion", "amount": "1 small", "isMissing": false },
          { "name": "heavy cream", "amount": "150ml", "isMissing": true }
        ],
        "steps": [
          "Sauté diced onion and minced garlic in a buttered pan.",
          "Sear chicken breasts until golden brown on both sides.",
          "Pour heavy cream and simmer until reduction coats the chicken."
        ],
        "nutrition": { "calories": 420, "protein": "34g", "carbs": "4g", "fat": "29g" },
        "chefTip": "Garnish with fresh parsley before serving.",
        "imageUrl": "https://res.cloudinary.com/..."
      }
    ]
  }
  ```

#### `POST /recipes/assistant`
Queries the AI Cooking assistant for a recipe. Enables conversions, substitutions, and scaling.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "What can I use instead of heavy cream?" }
    ],
    "recipe": { ...recipeObject }
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "answer": "You can substitute heavy cream with coconut milk for a dairy-free alternative, or use sour cream mixed with a splash of milk."
  }
  ```

#### `POST /recipes/scan-ocr`
Extracts a list of pantry items from an uploaded grocery list or receipt snapshot using Gemini.
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Body**: File binary attached under form field `image`
- **Response** (`200 OK`):
  ```json
  {
    "ingredients": ["chicken breast", "lemon", "rosemary", "olive oil"]
  }
  ```

#### `GET /recipes`
Lists saved recipes in the user library (filtered optionally by query, cuisine, or difficulty).
- **Query Params**: `cuisine=Italian`, `difficulty=Easy`, `query=garlic`
- **Response** (`200 OK`):
  ```json
  {
    "recipes": [...]
  }
  ```

#### `POST /recipes`
Saves a generated recipe to the user's permanent cookbook library.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Full recipe object details
- **Response** (`201 Created`):
  ```json
  {
    "message": "Recipe saved to library successfully",
    "recipe": { ...savedObject }
  }
  ```

#### `POST /recipes/favorite/:recipeId`
Toggles the favorited status of a recipe.
- **Response** (`200 OK`):
  ```json
  {
    "favorited": true
  }
  ```

#### `GET /recipes/favorites`
Lists all recipes favorited by the user.
- **Response** (`200 OK`):
  ```json
  {
    "favorites": [...]
  }
  ```

#### `POST /recipes/saved/:recipeId`
Toggles saved/bookmarked status.
- **Response** (`200 OK`):
  ```json
  {
    "saved": false
  }
  ```

#### `GET /recipes/saved`
Lists all recipes saved by the user.
- **Response** (`200 OK`):
  ```json
  {
    "saved": [...]
  }
  ```

#### `GET /recipes/grocery-list`
Gets the aggregated missing ingredients grocery list.
- **Response** (`200 OK`):
  ```json
  {
    "list": [
      { "name": "heavy cream", "amount": "150ml", "checked": false, "recipeId": "123" }
    ]
  }
  ```

#### `POST /recipes/grocery-list`
Updates/Saves the active grocery list.
- **Request Body**:
  ```json
  {
    "items": [
      { "name": "heavy cream", "amount": "150ml", "checked": true, "recipeId": "123" }
    ]
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "list": [...]
  }
  ```

---

### 3. Meal Planner

#### `GET /meals`
Lists all scheduled meal plans for the user.
- **Response** (`200 OK`):
  ```json
  {
    "mealPlans": [
      {
        "id": "mp_123",
        "recipeId": "rec_456",
        "date": "2026-07-10T00:00:00.000Z",
        "mealType": "DINNER",
        "recipe": { ...recipeDetails }
      }
    ]
  }
  ```

#### `POST /meals`
Schedules a recipe on the meal planner calendar.
- **Request Body**:
  ```json
  {
    "recipeId": "rec_456",
    "date": "2026-07-10",
    "mealType": "DINNER"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "message": "Recipe scheduled on meal planner successfully",
    "mealPlan": { ...mealPlanDetails }
  }
  ```

#### `DELETE /meals/:id`
Deletes a scheduled meal plan entry.
- **Response** (`200 OK`):
  ```json
  {
    "message": "Meal plan entry removed successfully"
  }
  ```
