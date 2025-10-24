import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserByUsername(username: string) {
  const { data: userData, error: userError } = await supabase
    .from('users_usernames')
    .select('auth_user_id, username, email')
    .eq('username', username)
    .single();

  if (userError || !userData) {
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('full_name, photo_url, pronouns, locale')
    .eq('uid', userData.auth_user_id)
    .single();

  if (profileError) {
    return null;
  }

  return {
    auth_user_id: userData.auth_user_id,
    username: userData.username,
    email: userData.email,
    ...profileData
  };
}