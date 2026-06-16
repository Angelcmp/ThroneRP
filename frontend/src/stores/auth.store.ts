import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      isAuthReady: false,
      setAuthReady: (isAuthReady) => set({ isAuthReady }),
    }),
    { name: "auth-store" },
  ),
);
