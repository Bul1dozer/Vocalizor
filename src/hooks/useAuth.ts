import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { UserProfile } from '../types';

export function useAuth() {
  const { user, setUser } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id, session.user.email ?? '');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) await fetchProfile(session.user.id, session.user.email ?? '');
      else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  async function fetchProfile(userId: string, email: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) { setUser(data as UserProfile); }
    else {
      const p: UserProfile = { id: userId, email, display_name: null, avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      await supabase.from('profiles').insert({ id: userId, email, display_name: null });
      setUser(p);
    }
  }

  async function signUp(email: string, password: string) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; }
  async function signIn(email: string, password: string) { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
  async function signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; setUser(null); }

  return { user, signUp, signIn, signOut, isAuthenticated: !!user };
}
