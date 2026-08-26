"use client";

import { useEffect } from "react";
import { hasSupabaseEnv } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { useSessionStore } from "@/store/session";
import type { Profile } from "@/types/database";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const setSession = useSessionStore((s) => s.setSession);
  const setLoading = useSessionStore((s) => s.setLoading);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      return (data as Profile | null) ?? null;
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setSession(null, null);
        return;
      }
      setSession(user, await loadProfile(user.id));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        setSession(null, null);
        return;
      }
      loadProfile(user.id).then((profile) => setSession(user, profile));
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  return children;
}
