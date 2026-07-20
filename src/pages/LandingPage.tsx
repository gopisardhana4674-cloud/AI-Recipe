import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, ArrowRight, Zap, Sparkles, Shield, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* Dynamic blurred ambient glow elements */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-orange-600/5 blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[-10%] -z-10 h-[60vw] w-[60vw] rounded-full bg-red-600/5 blur-[150px]" />

      {/* Header / Nav */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-orange-500/20 border border-orange-400/20">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Kitchen AI
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-12 py-12 lg:py-20">
        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
          >
            <Sparkles size={12} />
            <span>AI-Powered Recipe Architect v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
          >
            Cook Smarter with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              What’s in Your Fridge
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Stop staring blankly at your shelves. Enter your available ingredients, scan grocery receipts via OCR, and let our chef-tuned AI design customized gourmet recipes instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mt-4"
          >
            <Button size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto flex items-center gap-2">
              <span>Get Cooking Free</span>
              <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto">
              Explore Demo
            </Button>
          </motion.div>
        </div>

        {/* Right side: Beautiful visual grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-1 relative w-full max-w-md lg:max-w-none flex items-center justify-center"
        >
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.02] shadow-2xl backdrop-blur-xl flex items-center justify-center p-4">
            {/* Visual representation of food card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-gray-950/80 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
              alt="Gourmet dish"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Overlay card */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-gray-950/80 border border-white/10 backdrop-blur-md z-20 flex flex-col gap-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Recipe of the Day</span>
              <h3 className="text-lg font-extrabold text-white">Crispy Pan-Seared Salmon</h3>
              <p className="text-xs text-gray-400">Made using Garlic, Lemon, Spinach, Salmon, and Olive Oil</p>
              <div className="flex gap-4 text-xs font-medium text-gray-300 mt-2">
                <span>⏱ Prep: 10 mins</span>
                <span>🔥 Cook: 15 mins</span>
                <span>🟢 Easy</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-950/50 border-t border-white/[0.03] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Fully Packed Chef Toolkit
            </h2>
            <p className="text-gray-400 font-medium">
              Everything you need to eliminate food waste, design dinner, and scale kitchen logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold">OCR Receipt Scanning</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Snapshot your grocery receipts. Our OCR extractor will automatically load all ingredients into your digital pantry items list.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold">Intelligent Grocery Generator</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Generate missing ingredient checklists for recipes, compile aggregate shopping list registers, and copy/export items easily.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold">Interactive Cooking Checklists</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Check off cooking steps as you cook. Access a dedicated AI cooking assistant side-panel to scale sizes or ask substitutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-950 border-t border-white/[0.03] py-10 text-center text-xs text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} Kitchen AI. Built with ❤️ for elite home chefs.</p>
      </footer>
    </div>
  );
}
