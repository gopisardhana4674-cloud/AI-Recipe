import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      {/* Dynamic blurred ambient glow elements */}
      <div className="fixed top-[-10%] left-[-10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] -z-10 h-[60vw] w-[60vw] rounded-full bg-red-600/5 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <Navigation />

      {/* Main Page Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-500">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-950 border-t border-white/[0.03] py-6 text-center text-xs text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} Kitchen AI. Built with ❤️ for elite home chefs.</p>
      </footer>
    </div>
  );
}
