import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, LayoutDashboard, Utensils, Bookmark, Heart, Calendar, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/generate', label: 'Chef AI', icon: Utensils },
    { to: '/saved', label: 'My Recipes', icon: Bookmark },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/planner', label: 'Meal Planner', icon: Calendar },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-gray-950/70 border-b border-white/[0.05] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-orange-500/20 border border-orange-400/20">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Kitchen AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                    ${isActive
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-white/20 object-cover"
                />
                <span className="text-sm font-medium text-gray-300">{user.name}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center gap-1.5">
              <LogOut size={16} />
              <span>Log out</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-gray-950 border-b border-white/[0.05] py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all
                  ${isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 mt-2">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 rounded-full border border-white/20 object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-gray-400">{user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent transition-all mt-1 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
