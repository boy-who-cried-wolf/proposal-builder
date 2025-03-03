
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { getSavedProposalFormData } from '@/utils/localStorage';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Function to add user to Loops.so
  const addUserToLoops = async (email: string, userGroup: string = 'free') => {
    try {
      const { data, error } = await supabase.functions.invoke('loops-integration', {
        body: {
          action: 'createContact',
          userData: {
            email,
            userGroup,
            source: 'website_signup'
          }
        }
      });

      if (error) {
        console.error('Error adding user to Loops:', error);
      } else {
        console.log('User added to Loops successfully:', data);
      }
    } catch (error) {
      console.error('Error invoking Loops integration:', error);
    }
  };

  // Function to update user in Loops.so
  const updateUserInLoops = async (email: string, userGroup: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('loops-integration', {
        body: {
          action: 'updateContact',
          userData: {
            email,
            userGroup
          }
        }
      });

      if (error) {
        console.error('Error updating user in Loops:', error);
      } else {
        console.log('User updated in Loops successfully:', data);
      }
    } catch (error) {
      console.error('Error invoking Loops integration:', error);
    }
  };

  // Function to trigger an event in Loops.so
  const triggerLoopsEvent = async (email: string, eventName: string, customFields?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('loops-integration', {
        body: {
          action: 'triggerEvent',
          userData: {
            email,
            customFields
          },
          eventName
        }
      });

      if (error) {
        console.error(`Error triggering ${eventName} event in Loops:`, error);
      } else {
        console.log(`${eventName} event triggered in Loops successfully:`, data);
      }
    } catch (error) {
      console.error('Error invoking Loops integration:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Add user to Loops.so
      await addUserToLoops(email);
      
      toast.success('Account created successfully! Check your email to confirm.');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if we have saved form data that would indicate we should redirect to index
      const savedData = getSavedProposalFormData();
      if (savedData && location.pathname === '/auth') {
        navigate('/');
        toast.success('Logged in successfully! Your proposal data has been restored.');
      } else {
        navigate('/');
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid login credentials');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      // First, request password reset from Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      // Then, notify Loops.so about the password reset request
      await supabase.functions.invoke('loops-integration', {
        body: {
          action: 'passwordReset',
          userData: { email }
        }
      });
      
      toast.success('Password reset instructions sent to your email.');
    } catch (error: any) {
      toast.error(error.message || 'Error requesting password reset');
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
