import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ClipboardList, Trash2, CheckCircle2, Plus, Copy, Check, ChevronRight } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function SavedRecipes() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    savedRecipes,
    groceryList,
    isActionLoading,
    fetchSaved,
    fetchGroceryList,
    toggleSaved,
    addGroceryItems,
    toggleGroceryItem,
    removeGroceryItem,
    clearGroceryList,
  } = useRecipeStore();

  const [activeTab, setActiveTab] = useState<'saved' | 'grocery'>('saved');
  const [manualGroceryItem, setManualGroceryItem] = useState('');
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  // Sync tab based on URL hash (e.g. #grocery)
  useEffect(() => {
    if (location.hash === '#grocery') {
      setActiveTab('grocery');
    } else {
      setActiveTab('saved');
    }
  }, [location.hash]);

  useEffect(() => {
    fetchSaved();
    fetchGroceryList();
  }, [fetchSaved, fetchGroceryList]);

  const handleAddManualGrocery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualGroceryItem.trim()) {
      await addGroceryItems([{ name: manualGroceryItem.trim(), amount: '1 unit' }]);
      setManualGroceryItem('');
    }
  };

  const handleCopyChecklist = () => {
    const listString = groceryList
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.name} (${item.amount})`)
      .join('\n');
    
    navigator.clipboard.writeText(listString);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Personal Cook Library</span>
        </h1>
        
        {/* Toggle tabs */}
        <div className="flex p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl self-start">
          <button
            onClick={() => setActiveTab('saved')}
            className={`
              flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
              ${activeTab === 'saved'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/10'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <Bookmark size={14} />
            <span>Saved Recipes</span>
          </button>
          <button
            onClick={() => setActiveTab('grocery')}
            className={`
              flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
              ${activeTab === 'grocery'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/10'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            <ClipboardList size={14} />
            <span>Grocery Checklist</span>
          </button>
        </div>
      </div>

      {/* Render Saved Recipes */}
      {activeTab === 'saved' && (
        <div>
          {savedRecipes.length === 0 ? (
            <div className="py-20 border border-dashed border-white/10 rounded-3xl text-center text-gray-500 font-medium flex flex-col items-center gap-4">
              <Bookmark size={36} className="text-gray-600" />
              <div className="flex flex-col gap-1 max-w-xs">
                <span className="text-sm font-bold text-white">No Recipes Saved</span>
                <p className="text-xs text-gray-400">
                  Head over to the Recipe Generator page, run a cook search, and save your generated recipes.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="group cursor-pointer relative"
                >
                  <Card className="border-white/[0.05] hover:border-orange-500/20">
                    <div className="relative h-44 w-full overflow-hidden border-b border-white/[0.05]">
                      <img
                        src={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                        alt={recipe.title}
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleSaved(recipe);
                        }}
                        className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/70 border border-white/10 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <CardBody className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{recipe.cuisine}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">⏱ {recipe.cookTime}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {recipe.description}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Grocery checklist */}
      {activeTab === 'grocery' && (
        <div className="max-w-2xl mx-auto w-full">
          <Card className="border-white/[0.05]">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <ClipboardList size={16} className="text-orange-400" />
                <span>My Active Shopping List</span>
              </h2>
              {groceryList.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyChecklist} className="flex items-center gap-1">
                    {copiedChecklist ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copiedChecklist ? 'Copied' : 'Copy'}</span>
                  </Button>
                  <Button variant="danger" size="sm" onClick={clearGroceryList} className="flex items-center gap-1">
                    <Trash2 size={12} />
                    <span>Clear all</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody className="flex flex-col gap-6">
              {/* Add manual item */}
              <form onSubmit={handleAddManualGrocery} className="flex gap-2">
                <Input
                  placeholder="Add item manually (e.g. 2 liters Milk, Eggs)..."
                  value={manualGroceryItem}
                  onChange={(e) => setManualGroceryItem(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary" className="px-4">
                  <Plus size={16} />
                </Button>
              </form>

              {/* Items List */}
              {groceryList.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500 font-medium flex flex-col items-center gap-3">
                  <ClipboardList size={32} className="text-gray-700" />
                  <div className="flex flex-col gap-1 max-w-xs">
                    <span className="text-sm font-bold text-white">List is Empty</span>
                    <p className="text-xs text-gray-400">
                      Items marked missing during recipe cooking will automatically compile here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence>
                    {groceryList.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`
                          flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer
                          ${item.checked
                            ? 'bg-orange-500/[0.01] border-orange-500/10 opacity-50'
                            : 'bg-white/[0.01] hover:bg-white/[0.03] border-white/[0.04]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1" onClick={() => toggleGroceryItem(idx)}>
                          <CheckCircle2
                            size={18}
                            className={item.checked ? 'text-green-500' : 'text-gray-600'}
                            fill={item.checked ? 'rgba(34,197,94,0.1)' : 'none'}
                          />
                          <span className={`text-sm font-semibold ${item.checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-gray-500">{item.amount}</span>
                          <button
                            onClick={() => removeGroceryItem(idx)}
                            className="p-1 rounded bg-transparent text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
