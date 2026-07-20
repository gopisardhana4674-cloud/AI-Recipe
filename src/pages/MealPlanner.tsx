import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function MealPlanner() {
  const navigate = useNavigate();
  const {
    mealPlans,
    savedRecipes,
    fetchMealPlans,
    fetchSaved,
    addMealPlan,
    removeMealPlan,
  } = useRecipeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('DINNER');
  const [loading, setLoading] = useState(false);

  // Load plans
  useEffect(() => {
    fetchMealPlans();
    fetchSaved();
  }, [fetchMealPlans, fetchSaved]);

  // Generate 7 days starting from today
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };
  const weekDates = getWeekDates();

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipe || !selectedDate || !selectedMealType) return;
    setLoading(true);

    try {
      await addMealPlan(selectedRecipe, new Date(selectedDate), selectedMealType);
      setIsModalOpen(false);
      setSelectedRecipe('');
      setSelectedDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-orange-400" />
          <h1 className="text-2xl font-black text-white">Weekly Meal Planner</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1">
          <Plus size={16} />
          <span>Schedule a Meal</span>
        </Button>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDates.map((date) => {
          const dateStr = date.toDateString();
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = date.getDate();
          
          // Filter plans for this day
          const dayPlans = mealPlans.filter((p) => {
            return new Date(p.date).toDateString() === dateStr;
          });

          return (
            <Card key={dateStr} hoverEffect={false} className="border-white/[0.05] p-4 flex flex-col gap-4 min-h-[300px] bg-white/[0.01]">
              <div className="flex flex-col border-b border-white/5 pb-2 text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{dayName}</span>
                <span className="text-lg font-black text-white">{dayNum}</span>
              </div>

              {/* Meal Types slots */}
              <div className="flex-1 flex flex-col gap-3">
                {MEAL_TYPES.map((type) => {
                  const mealsOfType = dayPlans.filter((p) => p.mealType === type);
                  return (
                    <div key={type} className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{type}</span>
                      
                      {mealsOfType.length === 0 ? (
                        <div className="h-8 border border-dashed border-white/5 rounded-lg flex items-center justify-center text-[9px] text-gray-600 font-medium">
                          Empty
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {mealsOfType.map((meal) => (
                            <div
                              key={meal.id}
                              className="group flex items-center justify-between p-2 rounded-lg bg-orange-500/[0.03] border border-orange-500/10 hover:border-orange-500/30 transition-all relative overflow-hidden"
                            >
                              <div
                                onClick={() => meal.recipe && navigate(`/recipe/${meal.recipe.id}`)}
                                className="flex-1 text-[11px] font-semibold text-orange-300 hover:text-orange-200 truncate cursor-pointer pr-1"
                              >
                                {meal.recipe?.title}
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await removeMealPlan(meal.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer flex-shrink-0"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Schedule Meal Plan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Meal Plan">
        <form onSubmit={handleAddMeal} className="flex flex-col gap-4">
          {/* Select Recipe */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Recipe</label>
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white outline-none backdrop-blur-md transition-all cursor-pointer"
            >
              <option value="" className="bg-gray-950">Choose from Saved Library...</option>
              {savedRecipes.map((r) => (
                <option key={r.id} value={r.id} className="bg-gray-950">{r.title}</option>
              ))}
            </select>
            {savedRecipes.length === 0 && (
              <span className="text-[10px] text-orange-400 font-semibold mt-1">
                ⚠️ You don't have any saved recipes. Save a generated recipe first!
              </span>
            )}
          </div>

          {/* Select Date */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white outline-none backdrop-blur-md transition-all"
            />
          </div>

          {/* Select Meal Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Select Meal Type</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500/50 rounded-xl text-sm text-white outline-none backdrop-blur-md transition-all cursor-pointer"
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type} className="bg-gray-950">{type}</option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} disabled={savedRecipes.length === 0} className="w-full mt-2">
            Add to Planner
          </Button>
        </form>
      </Modal>
    </div>
  );
}
