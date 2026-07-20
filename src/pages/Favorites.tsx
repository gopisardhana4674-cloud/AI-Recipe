import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardBody } from '../components/ui/Card';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, fetchFavorites, toggleFavorite } = useRecipeStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span>Favorite Dishes</span>
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 border border-dashed border-white/10 rounded-3xl text-center text-gray-500 font-medium flex flex-col items-center gap-4">
          <Heart size={36} className="text-gray-600" />
          <div className="flex flex-col gap-1 max-w-xs">
            <span className="text-sm font-bold text-white">No Favorites Yet</span>
            <p className="text-xs text-gray-400">
              Heart recipes that you love from the cooking details page to compile them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
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
                      await toggleFavorite(recipe);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/70 border border-white/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Heart size={14} className="fill-red-500/20" />
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
  );
}
