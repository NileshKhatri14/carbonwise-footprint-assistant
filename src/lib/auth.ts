import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export async function register(name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password: password.trim(),
    options: {
      data: { display_name: name.trim() },
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password.trim(),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.display_name || user.email || 'User',
    email: user.email || '',
  };
}

export async function isOnboarded(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('profiles').select('onboarded').eq('user_id', user.id).single();
  return data?.onboarded ?? false;
}

export async function setOnboarded() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({ onboarded: true }).eq('user_id', user.id);
}
