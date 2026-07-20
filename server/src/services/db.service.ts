import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
// Using Node.js CommonJS globals for __dirname

const prisma = new PrismaClient();
const fallbackFilePath = path.join(__dirname, '../../data/fallback_db.json');

// Ensure fallback file directory exists
const dataDir = path.dirname(fallbackFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(fallbackFilePath)) {
  fs.writeFileSync(
    fallbackFilePath,
    JSON.stringify({
      users: [],
      recipes: [],
      favorites: [],
      savedRecipes: [],
      mealPlans: [],
      groceryLists: [],
    }, null, 2)
  );
}

// Check if we should use DB or Fallback JSON
const hasDBUrl = !!process.env.DATABASE_URL;

// Helper to read fallback db
function readFallback(): any {
  try {
    const content = fs.readFileSync(fallbackFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return {
      users: [],
      recipes: [],
      favorites: [],
      savedRecipes: [],
      mealPlans: [],
      groceryLists: [],
    };
  }
}

// Helper to write fallback db
function writeFallback(data: any) {
  try {
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write fallback DB:', err);
  }
}

export const dbService = {
  async connect(): Promise<boolean> {
    if (!hasDBUrl) {
      console.warn('⚠️ DATABASE_URL not set. Falling back to local JSON database.');
      return false;
    }
    try {
      await prisma.$connect();
      console.log('✅ Connected to Supabase PostgreSQL via Prisma.');
      return true;
    } catch (err) {
      console.error('❌ Failed to connect to Prisma DB. Falling back to local JSON database. Error:', err);
      return false;
    }
  },

  // USER CRUD
  async getUser(id: string) {
    if (hasDBUrl) {
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch (e) {
        console.error('Prisma getUser error, trying fallback', e);
      }
    }
    const db = readFallback();
    return db.users.find((u: any) => u.id === id) || null;
  },

  async createUser(id: string, email: string, name?: string, avatarUrl?: string) {
    const userData = { id, email, name: name || '', avatarUrl: avatarUrl || '', createdAt: new Date(), updatedAt: new Date() };
    if (hasDBUrl) {
      try {
        return await prisma.user.upsert({
          where: { id },
          update: { email, name, avatarUrl },
          create: userData,
        });
      } catch (e) {
        console.error('Prisma createUser error, trying fallback', e);
      }
    }
    const db = readFallback();
    const idx = db.users.findIndex((u: any) => u.id === id);
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], email, name, avatarUrl, updatedAt: new Date() };
    } else {
      db.users.push(userData);
    }
    writeFallback(db);
    return userData;
  },

  // RECIPES
  async getRecipes(filters: { cuisine?: string; difficulty?: string; userId?: string; query?: string }) {
    if (hasDBUrl) {
      try {
        const where: any = {};
        if (filters.cuisine) where.cuisine = filters.cuisine;
        if (filters.difficulty) where.difficulty = filters.difficulty;
        if (filters.userId) where.authorId = filters.userId;
        if (filters.query) {
          where.OR = [
            { title: { contains: filters.query, mode: 'insensitive' } },
            { description: { contains: filters.query, mode: 'insensitive' } },
          ];
        }
        return await prisma.recipe.findMany({ where, orderBy: { createdAt: 'desc' } });
      } catch (e) {
        console.error('Prisma getRecipes error, trying fallback', e);
      }
    }
    const db = readFallback();
    let list = [...db.recipes];
    if (filters.cuisine) list = list.filter((r) => r.cuisine.toLowerCase() === filters.cuisine?.toLowerCase());
    if (filters.difficulty) list = list.filter((r) => r.difficulty.toLowerCase() === filters.difficulty?.toLowerCase());
    if (filters.userId) list = list.filter((r) => r.authorId === filters.userId);
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    return list;
  },

  async getRecipe(id: string) {
    if (hasDBUrl) {
      try {
        return await prisma.recipe.findUnique({ where: { id } });
      } catch (e) {
        console.error('Prisma getRecipe error, trying fallback', e);
      }
    }
    const db = readFallback();
    return db.recipes.find((r: any) => r.id === id) || null;
  },

  async createRecipe(recipe: any) {
    const newRecipe = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...recipe,
    };
    if (hasDBUrl) {
      try {
        return await prisma.recipe.create({ data: recipe });
      } catch (e) {
        console.error('Prisma createRecipe error, trying fallback', e);
      }
    }
    const db = readFallback();
    db.recipes.push(newRecipe);
    writeFallback(db);
    return newRecipe;
  },

  // FAVORITES
  async toggleFavorite(userId: string, recipeId: string) {
    if (hasDBUrl) {
      try {
        const existing = await prisma.favorite.findUnique({
          where: { userId_recipeId: { userId, recipeId } },
        });
        if (existing) {
          await prisma.favorite.delete({
            where: { userId_recipeId: { userId, recipeId } },
          });
          return { favorited: false };
        } else {
          await prisma.favorite.create({
            data: { userId, recipeId },
          });
          return { favorited: true };
        }
      } catch (e) {
        console.error('Prisma toggleFavorite error, trying fallback', e);
      }
    }
    const db = readFallback();
    const idx = db.favorites.findIndex((f: any) => f.userId === userId && f.recipeId === recipeId);
    if (idx > -1) {
      db.favorites.splice(idx, 1);
      writeFallback(db);
      return { favorited: false };
    } else {
      db.favorites.push({ id: Math.random().toString(36).substring(2), userId, recipeId, createdAt: new Date() });
      writeFallback(db);
      return { favorited: true };
    }
  },

  async getFavorites(userId: string) {
    if (hasDBUrl) {
      try {
        const favs = await prisma.favorite.findMany({
          where: { userId },
          include: { recipe: true },
        });
        return favs.map((f) => f.recipe);
      } catch (e) {
        console.error('Prisma getFavorites error, trying fallback', e);
      }
    }
    const db = readFallback();
    const favRecipeIds = db.favorites.filter((f: any) => f.userId === userId).map((f: any) => f.recipeId);
    return db.recipes.filter((r: any) => favRecipeIds.includes(r.id));
  },

  // SAVED RECIPES
  async toggleSaved(userId: string, recipeId: string) {
    if (hasDBUrl) {
      try {
        const existing = await prisma.savedRecipe.findUnique({
          where: { userId_recipeId: { userId, recipeId } },
        });
        if (existing) {
          await prisma.savedRecipe.delete({
            where: { userId_recipeId: { userId, recipeId } },
          });
          return { saved: false };
        } else {
          await prisma.savedRecipe.create({
            data: { userId, recipeId },
          });
          return { saved: true };
        }
      } catch (e) {
        console.error('Prisma toggleSaved error, trying fallback', e);
      }
    }
    const db = readFallback();
    const idx = db.savedRecipes.findIndex((s: any) => s.userId === userId && s.recipeId === recipeId);
    if (idx > -1) {
      db.savedRecipes.splice(idx, 1);
      writeFallback(db);
      return { saved: false };
    } else {
      db.savedRecipes.push({ id: Math.random().toString(36).substring(2), userId, recipeId, createdAt: new Date() });
      writeFallback(db);
      return { saved: true };
    }
  },

  async getSaved(userId: string) {
    if (hasDBUrl) {
      try {
        const saved = await prisma.savedRecipe.findMany({
          where: { userId },
          include: { recipe: true },
        });
        return saved.map((s) => s.recipe);
      } catch (e) {
        console.error('Prisma getSaved error, trying fallback', e);
      }
    }
    const db = readFallback();
    const savedIds = db.savedRecipes.filter((s: any) => s.userId === userId).map((s: any) => s.recipeId);
    return db.recipes.filter((r: any) => savedIds.includes(r.id));
  },

  // MEAL PLANNER
  async getMealPlans(userId: string) {
    if (hasDBUrl) {
      try {
        return await prisma.mealPlan.findMany({
          where: { userId },
          include: { recipe: true },
          orderBy: { date: 'asc' },
        });
      } catch (e) {
        console.error('Prisma getMealPlans error, trying fallback', e);
      }
    }
    const db = readFallback();
    const plans = db.mealPlans.filter((mp: any) => mp.userId === userId);
    return plans.map((p: any) => ({
      ...p,
      recipe: db.recipes.find((r: any) => r.id === p.recipeId) || null,
    }));
  },

  async addMealPlan(userId: string, recipeId: string, date: Date, mealType: string) {
    const mealPlanData = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      userId,
      recipeId,
      date: new Date(date),
      mealType,
      createdAt: new Date(),
    };
    if (hasDBUrl) {
      try {
        return await prisma.mealPlan.create({
          data: {
            userId,
            recipeId,
            date: new Date(date),
            mealType,
          },
          include: { recipe: true },
        });
      } catch (e) {
        console.error('Prisma addMealPlan error, trying fallback', e);
      }
    }
    const db = readFallback();
    db.mealPlans.push(mealPlanData);
    writeFallback(db);
    return {
      ...mealPlanData,
      recipe: db.recipes.find((r: any) => r.id === recipeId) || null,
    };
  },

  async deleteMealPlan(id: string, userId: string) {
    if (hasDBUrl) {
      try {
        // Confirm owner
        const plan = await prisma.mealPlan.findUnique({ where: { id } });
        if (plan && plan.userId === userId) {
          await prisma.mealPlan.delete({ where: { id } });
          return true;
        }
        return false;
      } catch (e) {
        console.error('Prisma deleteMealPlan error, trying fallback', e);
      }
    }
    const db = readFallback();
    const idx = db.mealPlans.findIndex((mp: any) => mp.id === id && mp.userId === userId);
    if (idx > -1) {
      db.mealPlans.splice(idx, 1);
      writeFallback(db);
      return true;
    }
    return false;
  },

  // GROCERY LISTS
  async getGroceryList(userId: string) {
    if (hasDBUrl) {
      try {
        return await prisma.groceryList.findUnique({ where: { userId } });
      } catch (e) {
        console.error('Prisma getGroceryList error, trying fallback', e);
      }
    }
    const db = readFallback();
    return db.groceryLists.find((gl: any) => gl.userId === userId) || null;
  },

  async saveGroceryList(userId: string, items: any[]) {
    if (hasDBUrl) {
      try {
        return await prisma.groceryList.upsert({
          where: { userId },
          update: { items, updatedAt: new Date() },
          create: { userId, items },
        });
      } catch (e) {
        console.error('Prisma saveGroceryList error, trying fallback', e);
      }
    }
    const db = readFallback();
    const idx = db.groceryLists.findIndex((gl: any) => gl.userId === userId);
    const groceryData = { id: Math.random().toString(36).substring(2), userId, items, updatedAt: new Date() };
    if (idx > -1) {
      db.groceryLists[idx] = groceryData;
    } else {
      db.groceryLists.push(groceryData);
    }
    writeFallback(db);
    return groceryData;
  },
};
