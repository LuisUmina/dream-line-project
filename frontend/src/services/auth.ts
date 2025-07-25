import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Sign up a new user
export async function signUp(email: string, password: string, name: string): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    // 1. Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in user metadata
        },
        emailRedirectTo: undefined // Disable email confirmation redirect
      }
    });

    if (error) throw error;

    if (!data.user) {
      return { user: null, error: 'No se pudo crear el usuario.' };
    }

    // 2. Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Fetch the created profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching created profile:', profileError);
      return { user: null, error: 'Error al crear el perfil del usuario.' };
    }

    // 4. Create the user object with profile data and metadata
    const user: User = {
      id: profileData.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || name,
      xp: profileData.xp,
      level: profileData.level,
      streak: profileData.streak,
      lastActiveDate: profileData.last_active_date,
      completedLessons: [],
      badges: [
        {
          id: 'welcome',
          name: 'Bienvenido',
          description: 'Te has unido a la plataforma',
          icon: '👋',
          earnedAt: new Date().toISOString(),
        }
      ],
      createdAt: profileData.created_at,
    };

    return { user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { 
      user: null, 
      error: error.message || 'Error en el registro. Por favor, intenta de nuevo.' 
    };
  }
}

// Sign in existing user
export async function signIn(email: string, password: string): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) {
      return { user: null, error: 'No se pudo iniciar sesión.' };
    }

    // Fetch the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return { user: null, error: 'Error al obtener el perfil de usuario.' };
    }

    // Update last active date
    await supabase
      .from('profiles')
      .update({ last_active_date: new Date().toISOString() })
      .eq('id', data.user.id);

    // Create the user object with profile data and metadata
    const user: User = {
      id: profileData.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || profileData.name || 'Usuario',
      xp: profileData.xp || 0,
      level: profileData.level || 1,
      streak: profileData.streak || 0,
      lastActiveDate: profileData.last_active_date || new Date().toISOString(),
      completedLessons: [], // Initialize empty array since not stored in DB yet
      badges: [
        {
          id: 'welcome',
          name: 'Bienvenido',
          description: 'Te has unido a la plataforma',
          icon: '👋',
          earnedAt: profileData.created_at || new Date().toISOString(),
        }
      ],
      createdAt: profileData.created_at || new Date().toISOString(),
    };

    return { user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { 
      user: null, 
      error: error.message || 'Error en el inicio de sesión. Por favor, intenta de nuevo.' 
    };
  }
}

// Sign out current user
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || 'Error al cerrar sesión.' };
  }
}

// Get current session
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  return data.session;
}

// Get user profile
export async function getUserProfile(userId: string): Promise<{
  user: User | null;
  error: string | null;
}> {
  try {
    // Get the auth user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Create the user object with profile data and metadata
    const user: User = {
      id: data.id,
      email: authUser?.email || '',
      name: authUser?.user_metadata?.name || 'Usuario',
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 0,
      lastActiveDate: data.last_active_date || new Date().toISOString(),
      completedLessons: [], // Initialize empty array since not stored in DB yet
      badges: [
        {
          id: 'welcome',
          name: 'Bienvenido',
          description: 'Te has unido a la plataforma',
          icon: '👋',
          earnedAt: data.created_at || new Date().toISOString(),
        }
      ],
      createdAt: data.created_at || new Date().toISOString(),
    };

    return { user, error: null };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return { 
      user: null, 
      error: error.message || 'Error al obtener el perfil de usuario.' 
    };
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el correo de restablecimiento de contraseña.' 
    };
  }
}

// Update user password
export async function updatePassword(password: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { 
      success: false, 
      error: error.message || 'Error al actualizar la contraseña.' 
    };
  }
}
