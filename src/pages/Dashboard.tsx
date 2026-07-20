import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, Plus, Sparkles, BookOpen, Heart, Calendar, ClipboardList, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    availableIngredients,
    savedRecipes,
    favorites,
    mealPlans,
    groceryList,
    fetchSaved,
    fetchFavorites,
    fetchMealPlans,
    fetchGroceryList,
    toggleGroceryItem,
  } = useRecipeStore();

  useEffect(() => {
    fetchSaved();
    fetchFavorites();
    fetchMealPlans();
    fetchGroceryList();
  }, [fetchSaved, fetchFavorites, fetchMealPlans, fetchGroceryList]);

  // Summarize meal plans for today
  const todayStr = new Date().toDateString();
  const todayMeals = mealPlans.filter((mp) => {
    return new Date(mp.date).toDateString() === todayStr;
  });

  const stats = [
    { label: 'Pantry items', value: availableIngredients.length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Saved recipes', value: savedRecipes.length, icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Favorites', value: favorites.length, icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Today\'s meals', value: todayMeals.length, icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-r from-orange-500/20 via-red-500/10 to-transparent p-8 sm:p-10 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-orange-400 text-sm font-bold tracking-wider uppercase">
          <Sparkles size={16} />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
          Welcome back, <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{user?.name}</span>!
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl font-medium">
          Ready to whip up something delicious? You have <strong className="text-white">{availableIngredients.length} ingredients</strong> ready to be used.
        </p>
        <div className="flex gap-4 mt-2">
          <Button size="md" onClick={() => navigate('/generate')} className="flex items-center gap-1.5 shadow-md shadow-orange-500/15">
            <Plus size={16} />
            <span>Enter Ingredients</span>
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/saved')} className="flex items-center gap-1.5">
            <span>Explore Pantry</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} hoverEffect className="border-white/[0.05] p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon ? <stat.icon size={20} /> : <ChefHat size={20} />}
            </div>
          </Card>
        ))}
      </div>

      {/* Core Split Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scheduled Meals & Recents */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Today's Meals schedule */}
          <Card className="border-white/[0.05]">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white">Scheduled for Today</h2>
              </div>
              <span className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer" onClick={() => navigate('/planner')}>
                View planner
              </span>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {todayMeals.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 font-medium">
                  No meals scheduled for today. Click the meal planner to schedule your week!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todayMeals.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => meal.recipe && navigate(`/recipe/${meal.recipe.id}`)}
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={meal.recipe?.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100&auto=format&fit=crop'}
                            alt={meal.recipe?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-orange-400 tracking-wider uppercase">{meal.mealType}</span>
                          <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                            {meal.recipe?.title}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recently Saved Recipes grid */}
          <Card className="border-white/[0.05]">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white">Recently Saved Recipes</h2>
              </div>
              <span className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer" onClick={() => navigate('/saved')}>
                View all
              </span>
            </CardHeader>
            <CardBody>
              {savedRecipes.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 font-medium">
                  Your saved library is empty. Try generating a recipe and saving it!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedRecipes.slice(0, 4).map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="group flex flex-col gap-3 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300 cursor-pointer"
                    >
                      <div className="h-32 w-full rounded-lg overflow-hidden border border-white/10 relative">
                        <img
                          src={recipe.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&auto=format&fit=crop'}
                          alt={recipe.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-bold text-gray-300">
                          ⏱ {recipe.cookTime}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{recipe.cuisine}</span>
                        <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                          {recipe.title}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {recipe.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Grocery list widget */}
        <div className="flex flex-col gap-8">
          <Card className="border-white/[0.05] h-full">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white">Active Grocery List</h2>
              </div>
              {groceryList.length > 0 && (
                <span className="text-xs font-semibold text-orange-400 hover:underline cursor-pointer" onClick={() => navigate('/saved#grocery')}>
                  Manage list
                </span>
              )}
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {groceryList.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">
                  Your grocery list is empty. Generated missing items will appear here!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {groceryList.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleGroceryItem(idx)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          size={18}
                          className={item.checked ? 'text-green-500' : 'text-gray-600'}
                          fill={item.checked ? 'rgba(34,197,94,0.1)' : 'none'}
                        />
                        <span className={`text-sm font-semibold ${item.checked ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-bold">{item.amount}</span>
                    </div>
                  ))}
                  {groceryList.length > 6 && (
                    <div
                      onClick={() => navigate('/saved#grocery')}
                      className="text-center py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      + {groceryList.length - 6} more items
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
