import { create } from 'zustand';

// Load from localStorage on initialization
const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { token: parsed.token, user: parsed.user };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  return { token: null, user: null };
};

const { token: initialToken, user: initialUser } = loadAuthFromStorage();

export const useAuthStore = create((set) => ({
  token: initialToken,
  user: initialUser,
  setAuth: (token, user) => {
    localStorage.setItem('auth-storage', JSON.stringify({ token, user }));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ token: null, user: null });
  },
}));
