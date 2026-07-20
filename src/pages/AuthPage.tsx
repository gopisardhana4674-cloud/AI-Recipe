import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, User, Lock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginMock, isAuthenticated, isLoading } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please fill in your email address.');
      return;
    }
    if (!isLogin && !name) {
      setError('Please fill in your name.');
      return;
    }

    try {
      if (isLogin) {
        // Log in using mock wrapper
        await loginMock(email, email.split('@')[0]);
      } else {
        // Sign up
        await loginMock(email, name);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-6 text-white relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] -z-10 h-[50vw] w-[50vw] rounded-full bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] -z-10 h-[60vw] w-[60vw] rounded-full bg-red-600/5 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 border border-orange-400/20 animate-bounce">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent tracking-tight">
            Kitchen AI
          </h1>
          <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Your digital pantry assistant</p>
        </div>

        {/* Card wrapper */}
        <Card hoverEffect={false} className="border-white/[0.08] bg-white/[0.02]">
          <CardHeader className="border-white/[0.05] pb-2 text-center flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-gray-400">
              {isLogin ? 'Enter email credentials to sync your kitchen items' : 'Build a smart kitchen profile today'}
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {/* Name (Signup only) */}
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="Chef Auguste"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                />
              )}

              {/* Email */}
              <Input
                label="Email Address"
                placeholder="cook@kitchenai.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />

              {/* Password (Simulated/Mock input for UX completeness) */}
              <Input
                label="Password (Simulated)"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                required={false}
              />

              <Button type="submit" loading={isLoading} size="lg" className="w-full mt-2">
                {isLogin ? 'Sign In to Kitchen' : 'Initialize Kitchen'}
              </Button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-xs font-semibold text-gray-400 hover:text-orange-400 transition-colors cursor-pointer"
              >
                {isLogin ? "Don't have a kitchen account? Sign Up" : 'Already have a kitchen account? Sign In'}
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Clerk Auth Indicator note */}
        <div className="flex items-center gap-1.5 justify-center px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <Sparkles size={12} className="text-orange-500 animate-pulse" />
          <span>Local Mock Session Sync Activated</span>
        </div>
      </div>
    </div>
  );
}
