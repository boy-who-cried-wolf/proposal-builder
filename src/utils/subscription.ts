
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PlanType = 'free' | 'premium' | 'enterprise';

export const upgradeToPaidPlan = async (
  email: string,
  planType: PlanType,
  customFields?: Record<string, any>
) => {
  try {
    // 1. Update the user's plan in Loops.so
    const { data, error } = await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'updateContact',
        userData: {
          email,
          userGroup: planType,
          customFields
        }
      }
    });

    if (error) {
      throw error;
    }

    // 2. Trigger the plan upgrade event in Loops.so
    const eventResult = await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'triggerEvent',
        userData: {
          email,
          customFields
        },
        eventName: `plan_upgraded_to_${planType}`
      }
    });

    if (eventResult.error) {
      console.error('Error triggering plan upgrade event:', eventResult.error);
    }

    toast.success(`Successfully upgraded to ${planType} plan!`);
    return data;
  } catch (error: any) {
    console.error('Error upgrading plan:', error);
    toast.error(error.message || 'Failed to upgrade plan');
    throw error;
  }
};

// Example function to handle when a user subscribes to a paid plan
export const handleSubscription = async (
  email: string, 
  planType: PlanType, 
  paymentInfo?: Record<string, any>
) => {
  try {
    // This function could be called after successful payment processing
    const customFields = {
      subscriptionDate: new Date().toISOString(),
      ...paymentInfo
    };

    await upgradeToPaidPlan(email, planType, customFields);
    
    // You could also update your local database or state here
    
    return true;
  } catch (error) {
    console.error('Error handling subscription:', error);
    return false;
  }
};
