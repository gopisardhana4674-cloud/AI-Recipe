import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { ChefHat, Mail, User, Shield } from 'lucide-react';

export default function Profile() {
  const { user, isMockAuth } = useAuthStore();
  const { savedRecipes, favorites, availableIngredients } = useRecipeStore();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-black text-white">Chef Profile</h1>
      </div>

      <Card hoverEffect={false} className="border-white/[0.05]">
        <CardBody className="flex flex-col sm:flex-row items-center gap-6 p-8">
          {/* Avatar image */}
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-orange-500/30 flex-shrink-0">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Auguste'}
              alt={user?.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col gap-4 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{user?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold uppercase tracking-wider">
                  Head Chef
                </span>
              </h2>
              <span className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail size={14} className="text-gray-500" />
                {user?.email}
              </span>
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-gray-500 font-bold uppercase tracking-wider border-t border-white/5 pt-4 mt-2">
              <Shield size={12} className="text-orange-500" />
              <span>{isMockAuth ? 'Local Mock Session Sync' : 'Clerk Authenticated Provider'}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Culinary Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect className="border-white/[0.05] p-5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Recipes Created</span>
          <span className="text-3xl font-black text-orange-400">
            {savedRecipes.filter(r => r.isGenerated).length}
          </span>
        </Card>
        <Card hoverEffect className="border-white/[0.05] p-5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Favorited Items</span>
          <span className="text-3xl font-black text-red-400">{favorites.length}</span>
        </Card>
        <Card hoverEffect className="border-white/[0.05] p-5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Pantry Stocks</span>
          <span className="text-3xl font-black text-yellow-400">{availableIngredients.length}</span>
        </Card>
      </div>
    </div>
  );
}
