"use client";

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import type { Profile } from "@/types/database";

type SessionState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (user: User | null, profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setSession: (user, profile) => set({ user, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
