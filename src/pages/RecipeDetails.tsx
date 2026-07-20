import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Bookmark, Printer, Share2, Sparkles, MessageSquare, Check, X, AlertTriangle, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import { useRecipeStore, Recipe } from '../store/recipeStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import CookingAssistant from './CookingAssistant';

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    generatedRecipes,
    savedRecipes,
    favorites,
    isActionLoading,
    activeRecipe,
    fetchSaved,
    fetchFavorites,
    fetchRecipeDetails,
    toggleFavorite,
    toggleSaved,
    saveRecipeToLibrary,
    addGroceryItems,
  } = useRecipeStore();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [groceryAdded, setGroceryAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchSaved();
    fetchFavorites();
  }, [fetchSaved, fetchFavorites]);

  // Load recipe based on source
  useEffect(() => {
    if (!id) return;
    
    if (id.startsWith('generated_')) {
      const idx = parseInt(id.replace('generated_', ''), 10);
      const genRecipe = generatedRecipes[idx] || activeRecipe;
      if (genRecipe) {
        setRecipe(genRecipe);
        setCheckedSteps(new Array(genRecipe.steps.length).fill(false));
      } else {
        navigate('/dashboard');
      }
    } else {
      // Find inside saved recipes locally first, or active
      const localSaved = savedRecipes.find((r) => r.id === id);
      if (localSaved) {
        setRecipe(localSaved);
        setCheckedSteps(new Array(localSaved.steps.length).fill(false));
      } else {
        const target = activeRecipe && activeRecipe.id === id ? activeRecipe : null;
        if (target) {
          setRecipe(target);
          setCheckedSteps(new Array(target.steps.length).fill(false));
        } else {
          // Fetch from backend
          (async () => {
            setIsLoading(true);
            setLoadError(null);
            const fetched = await fetchRecipeDetails(id);
            setIsLoading(false);
            if (fetched) {
              setRecipe(fetched);
              setCheckedSteps(new Array(fetched.steps.length).fill(false));
            } else {
              setLoadError('Failed to load recipe details. It may have been deleted or you do not have permission.');
            }
          })();
        }
      }
    }
  }, [id, generatedRecipes, savedRecipes, activeRecipe, navigate, fetchRecipeDetails]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-gray-400">Loading recipe details...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-red-400 font-medium gap-4">
        <span>{loadError}</span>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 font-medium">
        Recipe not found.
      </div>
    );
  }

  const isFavorited = favorites.some((f) => f.id === recipe.id);
  const isSaved = savedRecipes.some((s) => s.id === recipe.id);
  const isGeneratedMock = id?.startsWith('generated_');

  const handleSaveToLibrary = async () => {
    if (isSaved) return;
    await saveRecipeToLibrary(recipe);
  };

  const handleToggleFav = async () => {
    // If it's a generated recipe, save it first before favoriting
    if (isGeneratedMock && !isSaved) {
      await saveRecipeToLibrary(recipe);
    }
    await toggleFavorite(recipe);
  };

  const handleToggleSaved = async () => {
    if (isGeneratedMock && !isSaved) {
      await saveRecipeToLibrary(recipe);
    } else {
      await toggleSaved(recipe);
    }
  };

  const handleAddMissingToGrocery = async () => {
    const missing = recipe.ingredients
      .filter((ing) => ing.isMissing)
      .map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        recipeId: recipe.id,
      }));

    if (missing.length > 0) {
      await addGroceryItems(missing);
      setGroceryAdded(true);
      setTimeout(() => setGroceryAdded(false), 3000);
    }
  };

  const handleStepToggle = (index: number) => {
    const copy = [...checkedSteps];
    copy[index] = !copy[index];
    setCheckedSteps(copy);
  };

  const handleShare = () => {
    const text = `Check out this recipe: ${recipe.title}! Ingredients: ${recipe.ingredients.map(i => i.name).join(', ')}`;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    
    // Also trigger system share if supported
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      }).catch(err => console.error(err));
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(recipe.title, 20, y);
    y += 10;

    // Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cuisine: ${recipe.cuisine}  |  Difficulty: ${recipe.difficulty}  |  Servings: ${recipe.servings}`, 20, y);
    y += 15;

    // Description
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const descLines = doc.splitTextToSize(recipe.description, 170);
    doc.text(descLines, 20, y);
    y += (descLines.length * 6) + 10;

    // Ingredients
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingredients:', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recipe.ingredients.forEach((ing) => {
      doc.text(`- ${ing.amount} ${ing.name} ${ing.isMissing ? '(Missing)' : ''}`, 25, y);
      y += 6;
    });
    y += 8;

    // Steps
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cooking Steps:', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recipe.steps.forEach((step, idx) => {
      const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, 160);
      doc.text(stepLines, 25, y);
      y += (stepLines.length * 6);
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    y += 8;

    // Nutrition
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estimated Nutrition:', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Calories: ${recipe.nutrition.calories}  |  Protein: ${recipe.nutrition.protein}  |  Carbs: ${recipe.nutrition.carbs}  |  Fat: ${recipe.nutrition.fat}`, 20, y);
    y += 12;

    // Chef Tip
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Chef's Tip:", 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const tipLines = doc.splitTextToSize(recipe.chefTip, 170);
    doc.text(tipLines, 20, y);

    // Save
    doc.save(`${recipe.title.replace(/\s+/g, '_')}_Recipe.pdf`);
  };

  const missingIngredients = recipe.ingredients.filter((i) => i.isMissing);

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex gap-2">
          {/* Save / Bookmarks */}
          <Button variant="secondary" size="sm" onClick={handleToggleSaved} className="px-3">
            <Bookmark size={16} className={isSaved ? 'text-orange-400 fill-orange-400/20' : 'text-gray-400'} />
          </Button>

          {/* Favorite */}
          <Button variant="secondary" size="sm" onClick={handleToggleFav} className="px-3">
            <Heart size={16} className={isFavorited ? 'text-red-500 fill-red-500/20' : 'text-gray-400'} />
          </Button>

          {/* Share */}
          <Button variant="secondary" size="sm" onClick={handleShare} className="px-3 text-xs flex items-center gap-1">
            <Share2 size={16} />
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </Button>

          {/* Print / PDF */}
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF} className="px-3 text-xs flex items-center gap-1">
            <Printer size={16} />
            <span>PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Details, Ingredients, Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Recipe Title, Description, Image & Steps */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Banner section */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row h-full">
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center gap-4">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">{recipe.cuisine} Cuisine</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{recipe.title}</h1>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">{recipe.description}</p>
              
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-300 border-t border-white/5 pt-4 mt-2">
                <span>⏱ Prep: {recipe.prepTime}</span>
                <span>🔥 Cook: {recipe.cookTime}</span>
                <span>👥 Servings: {recipe.servings}</span>
                <span>🟢 {recipe.difficulty}</span>
              </div>
            </div>
            
            {/* Image display */}
            <div className="w-full sm:w-64 h-56 sm:h-auto border-t sm:border-t-0 sm:border-l border-white/[0.05]">
              <img
                src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                alt={recipe.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Cooking steps with interactive checks */}
          <Card className="border-white/[0.05]">
            <CardHeader className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white font-serif">Step-by-Step Cooking Steps</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAssistantOpen(true)}
                className="text-orange-400 font-bold hover:text-orange-300 text-xs flex items-center gap-1"
              >
                <MessageSquare size={14} />
                Ask Assistant
              </Button>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {recipe.steps.map((step, idx) => {
                const checked = checkedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => handleStepToggle(idx)}
                    className={`
                      group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer
                      ${checked
                        ? 'bg-orange-500/[0.02] border-orange-500/20 opacity-60'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.04] hover:border-white/[0.08]'
                      }
                    `}
                  >
                    <button
                      className={`
                        mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer flex-shrink-0
                        ${checked
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-white/20 group-hover:border-white/40 text-transparent'
                        }
                      `}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-xs font-bold ${checked ? 'text-orange-500' : 'text-gray-400'}`}>
                        Step {idx + 1}
                      </span>
                      <p className={`text-sm leading-relaxed font-medium ${checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Ingredients in-stock verification & Nutrition */}
        <div className="flex flex-col gap-8">
          {/* Ingredients list pantry verification */}
          <Card className="border-white/[0.05]">
            <CardHeader className="flex flex-col gap-1 pb-3">
              <h2 className="text-base font-bold text-white">Pantry Check</h2>
              <p className="text-xs text-gray-500">Highlighted missing items required for recipe</p>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {recipe.ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-center justify-between p-3 rounded-xl border text-sm font-semibold
                      ${ing.isMissing
                        ? 'bg-red-500/[0.02] border-red-500/10 text-red-300'
                        : 'bg-green-500/[0.02] border-green-500/10 text-green-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {ing.isMissing ? (
                        <AlertTriangle size={14} className="text-red-400" />
                      ) : (
                        <Check size={14} className="text-green-400" />
                      )}
                      <span className="capitalize">{ing.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{ing.amount}</span>
                  </div>
                ))}
              </div>

              {missingIngredients.length > 0 && (
                <Button
                  onClick={handleAddMissingToGrocery}
                  loading={isActionLoading}
                  variant={groceryAdded ? 'secondary' : 'primary'}
                  className="w-full text-xs font-bold"
                >
                  {groceryAdded ? 'Added to Grocery Checklist!' : `Add ${missingIngredients.length} missing items to Grocery List`}
                </Button>
              )}
            </CardBody>
          </Card>

          {/* Nutrition Facts */}
          <Card className="border-white/[0.05]">
            <CardHeader>
              <h2 className="text-base font-bold text-white">Estimated Nutrition</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Calories</span>
                  <span className="text-lg font-black text-white">{recipe.nutrition.calories} kcal</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Protein</span>
                  <span className="text-lg font-black text-orange-400">{recipe.nutrition.protein}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Carbs</span>
                  <span className="text-lg font-black text-yellow-400">{recipe.nutrition.carbs}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex flex-col gap-0.5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fat</span>
                  <span className="text-lg font-black text-red-400">{recipe.nutrition.fat}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Chef Tip card */}
          <Card className="border-orange-500/10 bg-gradient-to-br from-orange-500/[0.03] to-red-500/[0.03]">
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest">
                <Sparkles size={14} className="animate-spin duration-3000" />
                <span>Chef Auguste's Secret Tip</span>
              </div>
              <p className="text-sm italic text-gray-300 leading-relaxed">
                "{recipe.chefTip}"
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Cooking Assistant Chat Overlay Dialog */}
      <CookingAssistant
        recipe={recipe}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}
