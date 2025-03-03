
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createCheckoutSession = async (userId: string, planId: string) => {
  try {
    console.log(`Creating checkout session for user ${userId} and plan ${planId}`);
    
    // Check connectivity to Supabase Functions - without using process.env
    try {
      const functionUrl = `${window.location.protocol}//${window.location.host}/functions/v1/stripe-integration/health`;
      const connectivityCheck = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession()}`
        }
      });
      console.log('Edge Function connectivity check:', connectivityCheck.status);
    } catch (error) {
      console.error('Edge Function connectivity check failed:', error);
      // Continue anyway as this is just a diagnostic check
    }
    
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'createCheckoutSession', userId, planId }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to connect to payment service. Please try again later.');
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
    console.log(`Fetching subscription for user ${userId}`);
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'getCurrentSubscription', userId }
    });

    if (error) {
      console.error('Error fetching subscription:', error);
      return { plan_id: 'free', status: 'active' }; // Default to free plan on error
    }

    console.log('Subscription data retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { plan_id: 'free', status: 'active' }; // Default to free plan on error
  }
};

export const cancelSubscription = async (userId: string) => {
  try {
    console.log(`Cancelling subscription for user ${userId}`);
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

export const createCustomerPortalSession = async (userId: string) => {
  try {
    console.log(`Creating customer portal session for user ${userId}`);
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'createCustomerPortalSession', userId }
    });

    if (error) {
      console.error('Error creating customer portal session:', error);
      toast.error('Failed to open the customer portal. Please try again later.');
      throw error;
    }

    if (!data) {
      console.error('No data in response');
      toast.error('Invalid response from server. Please try again later.');
      return null;
    }

    console.log('Customer portal session response:', data);

    if (data.error) {
      console.error('Error from Stripe integration:', data.error);
      toast.error(`Error opening customer portal: ${data.error}`);
      return null;
    }

    // Redirect to Stripe Customer Portal
    if (data?.url) {
      console.log('Redirecting to Stripe customer portal:', data.url);
      window.location.href = data.url;
      return data;
    } else {
      console.error('No URL in response:', data);
      toast.error('Invalid response from payment processor. Please try again.');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Something went wrong. Please try again.');
    throw error;
  }
};

export const getPlansWithPricing = async () => {
  try {
    console.log('Fetching plans with pricing from Stripe');
    const { data, error } = await supabase.functions.invoke('stripe-integration', {
      body: { action: 'getPlansWithPricing' }
    });

    if (error) {
      console.error('Error fetching plans with pricing:', error);
      toast.error('Failed to load subscription plans. Using default pricing.');
      return null;
    }

    console.log('Plans with pricing data retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error fetching plans with pricing:', error);
    toast.error('Something went wrong loading plan details. Using default pricing.');
    return null;
  }
};
