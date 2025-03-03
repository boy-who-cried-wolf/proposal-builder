
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addUserToLoops, notifyLoopsPasswordReset } from '@/utils/loopsIntegration';

/**
 * Registers a new user with email and password
 */
export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw error;
    
    // Add user to Loops.so with first and last name if available
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;
    await addUserToLoops(email, 'free', fullName);
    
    toast.success('Account created successfully! Check your email to confirm.');
  } catch (error: any) {
    toast.error(error.message || 'An error occurred during sign up');
    throw error;
  }
};

/**
 * Signs in a user with email and password
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    toast.success('Logged in successfully!');
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || 'Invalid login credentials');
    throw error;
  }
};

/**
 * Signs out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast.success('Logged out successfully!');
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || 'Error signing out');
    throw error;
  }
};

/**
 * Requests a password reset for a user
 */
export const requestPasswordReset = async (email: string) => {
  try {
    // Generate the password reset link
    const resetUrl = `${window.location.origin}/auth/reset-password`;
    
    // First, request password reset from Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });
    
    if (error) throw error;
    
    // Then, send a transactional email via Loops.so with the reset link
    await notifyLoopsPasswordReset(email, resetUrl);
    
    toast.success('Password reset instructions sent to your email.');
    return { success: true };
  } catch (error: any) {
    toast.error(error.message || 'Error requesting password reset');
    throw error;
  }
};
