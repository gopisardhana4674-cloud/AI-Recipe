import { create } from 'zustand';
import axios from 'axios';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockAuth: boolean;
  
  // Actions
  loginMock: (email: string, name: string) => Promise<void>;
  signupMock: (email: string, name: string) => Promise<void>;
  logout: () => void;
  setClerkUser: (clerkUser: any, token: string) => void;
  syncBackendUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('recipe_user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('recipe_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('recipe_token') : false,
  isLoading: false,
  isMockAuth: typeof window !== 'undefined' ? localStorage.getItem('recipe_is_mock') === 'true' : true,

  loginMock: async (email, name) => {
    set({ isLoading: true });
    try {
      const mockId = 'mock_user_' + Math.random().toString(36).substring(2, 8);
      const mockToken = 'mock_token_' + mockId;
      const userProfile: UserProfile = {
        id: mockId,
        email,
        name,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      };

      localStorage.setItem('recipe_user', JSON.stringify(userProfile));
      localStorage.setItem('recipe_token', mockToken);
      localStorage.setItem('recipe_is_mock', 'true');

      set({
        user: userProfile,
        token: mockToken,
        isAuthenticated: true,
        isMockAuth: true,
        isLoading: false,
      });

      // Sync backend user database
      await get().syncBackendUser();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signupMock: async (email, name) => {
    return get().loginMock(email, name);
  },

  logout: () => {
    localStorage.removeItem('recipe_user');
    localStorage.removeItem('recipe_token');
    localStorage.removeItem('recipe_is_mock');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isMockAuth: true,
    });
  },

  setClerkUser: (clerkUser, token) => {
    if (!clerkUser) return;
    const userProfile: UserProfile = {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || 'clerk@example.com',
      name: clerkUser.fullName || clerkUser.username || 'Clerk User',
      avatarUrl: clerkUser.imageUrl,
    };

    localStorage.setItem('recipe_user', JSON.stringify(userProfile));
    localStorage.setItem('recipe_token', token);
    localStorage.setItem('recipe_is_mock', 'false');

    set({
      user: userProfile,
      token,
      isAuthenticated: true,
      isMockAuth: false,
    });

    get().syncBackendUser().catch((err) => console.error('Failed syncing Clerk user to backend:', err));
  },

  syncBackendUser: async () => {
    const { token, user, isMockAuth } = get();
    if (!token || !user) return;

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (isMockAuth) {
        headers['x-mock-user-id'] = user.id;
        headers['x-mock-user-email'] = user.email;
        headers['x-mock-user-name'] = user.name;
      }

      await axios.post('/api/users/sync', {}, { headers });
    } catch (err) {
      console.error('Backend user sync failed:', err);
    }
  },
}));
