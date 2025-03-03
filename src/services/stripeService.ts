
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createCheckoutSession = async (userId: string, planId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'createCheckoutSession', userId, planId }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
      throw error;
    }

    // Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url;
    } else {
      toast.error('Invalid response from server');
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    toast.error('Something went wrong. Please try again.');
    throw error;
  }
};

export const getCurrentSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'getCurrentSubscription', userId }
    });

    if (error) {
      console.error('Error fetching subscription:', error);
      return { plan_id: 'free', status: 'active' }; // Default to free plan on error
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return { plan_id: 'free', status: 'active' }; // Default to free plan on error
  }
};

export const cancelSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'cancelSubscription', userId }
    });

    if (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
      throw error;
    }

    toast.success('Subscription successfully cancelled');
    return data;
  } catch (error) {
    console.error('Error:', error);
    toast.error('Something went wrong. Please try again.');
    throw error;
  }
};
