
import { supabase } from '@/integrations/supabase/client';

/**
 * Adds a new user to Loops.so
 * @param email User's email address
 * @param userGroup User group for segmentation (default: 'free')
 * @param fullName User's full name (optional)
 */
export const addUserToLoops = async (email: string, userGroup: string = 'free', fullName?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'createContact',
        userData: {
          email,
          userGroup,
          source: 'website_signup',
          ...(fullName && { fullName }),
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

/**
 * Updates a user's information in Loops.so
 * @param email User's email address
 * @param userGroup Updated user group
 */
export const updateUserInLoops = async (email: string, userGroup: string) => {
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

/**
 * Triggers an event in Loops.so for a specific user
 * @param email User's email address
 * @param eventName Name of the event to trigger
 * @param customFields Optional custom fields to include with the event
 */
export const triggerLoopsEvent = async (email: string, eventName: string, customFields?: Record<string, any>) => {
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

/**
 * Notifies Loops.so that a user has requested a password reset
 * @param email User's email address
 * @param passwordResetLink URL for password reset
 */
export const notifyLoopsPasswordReset = async (email: string, passwordResetLink: string) => {
  try {
    // Get the user's name from the profiles table if available
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('email', email)
      .single();
    
    const customFields = {
      firstName: profileData?.first_name || 'User',
      password_link: passwordResetLink
    };
    
    const { data, error } = await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'sendTransactional',
        userData: { 
          email,
          customFields
        },
        transactionalId: 'cm7t7msad024eyfcqcxz3wtgl'
      }
    });

    if (error) {
      console.error('Error sending password reset email via Loops:', error);
      throw error;
    } else {
      console.log('Password reset email sent via Loops successfully:', data);
    }
  } catch (error) {
    console.error('Error invoking Loops integration:', error);
    throw error; // Re-throw the error to be caught in the calling function
  }
};

/**
 * Upgrades a user to a paid plan and updates Loops.so accordingly
 * @param email User's email address
 * @param planType Type of paid plan
 */
export const upgradeToPaidPlan = async (email: string, planType: string = 'premium') => {
  try {
    // First update the user in Loops
    await updateUserInLoops(email, planType);
    
    // Then trigger the plan upgrade event
    await triggerLoopsEvent(email, 'plan_upgraded', { 
      planType,
      upgradeDate: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error upgrading user to paid plan:', error);
    return { success: false, error };
  }
};
