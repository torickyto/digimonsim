import { supabase } from './supabase';

interface SignUpData {
  email: string;
  password: string;
}

export async function signUp({ email, password }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    return { user: null, error: error.message };
  }
  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { user: null, error: error.message };
  }
  return { user: data.user, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}