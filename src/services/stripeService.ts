import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createCheckoutSession = async (userId: string, planId: string) => {
  try {
    console.log(`Creating checkout session for user ${userId} and plan ${planId}`);
    
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'createCheckoutSession', userId, planId }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session. Please try again later.');
      throw error;
    }

    if (!data) {
      console.error('No data in response');
      toast.error('Invalid response from server. Please try again later.');
      return null;
    }

    console.log('Checkout session response:', data);

    if (data.error) {
      console.error('Error from Stripe integration:', data.error);
      toast.error(`Payment processing error: ${data.error}`);
      return null;
    }

    // Redirect to Stripe Checkout
    if (data?.url) {
      console.log('Redirecting to Stripe checkout:', data.url);
      window.location.href = data.url;
      return data;
    } else {
      console.error('No URL in response:', data);
      toast.error('Invalid response from payment processor. Please try again.');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Something went wrong with the payment process. Please try again.');
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
