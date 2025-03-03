
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.11.0'

// Common response helpers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const errorResponse = (message, status = 500, details = null) => {
  console.error(`Error: ${message}`, details || '');
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const successResponse = (data) => {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Initialize Stripe and Supabase clients
const initClients = (mode = 'live') => {
  // Log environment variables availability
  console.log('Environment variables check:');
  console.log('STRIPE_SECRET_KEY available:', !!Deno.env.get('STRIPE_SECRET_KEY'));
  console.log('STRIPE_TEST_SECRET_KEY available:', !!Deno.env.get('STRIPE_TEST_SECRET_KEY'));
  console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'));
  console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
  
  // Test mode check
  const isTestMode = mode === 'test';
  console.log(`Using ${isTestMode ? 'TEST' : 'LIVE'} mode for Stripe`);
  
  // Initialize Stripe with appropriate key based on mode
  const stripeKey = isTestMode 
    ? Deno.env.get('STRIPE_TEST_SECRET_KEY') 
    : Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    throw new Error(`Missing ${isTestMode ? 'STRIPE_TEST_SECRET_KEY' : 'STRIPE_SECRET_KEY'} environment variable`);
  }

  // Get appropriate price IDs based on mode
  const freelancerPriceId = isTestMode
    ? Deno.env.get('STRIPE_TEST_FREELANCER_PRICE_ID')
    : Deno.env.get('STRIPE_FREELANCER_PRICE_ID');
    
  const proPriceId = isTestMode
    ? Deno.env.get('STRIPE_TEST_PRO_PRICE_ID')
    : Deno.env.get('STRIPE_PRO_PRICE_ID');
  
  // Log price IDs
  console.log('Using price IDs:');
  console.log('Freelancer:', freelancerPriceId);
  console.log('Pro:', proPriceId);

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
  });

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  return { 
    stripe, 
    supabase,
    priceIds: {
      freelancer: freelancerPriceId,
      pro: proPriceId
    },
    mode
  };
}

// Helper function to update user in Loops
const updateLoopsContact = async (supabase, email, userGroup) => {
  try {
    console.log(`Updating Loops contact for ${email} to group: ${userGroup}`);
    await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'updateContact',
        userData: {
          email,
          userGroup
        }
      }
    });
    
    // Also trigger an event for analytics
    await supabase.functions.invoke('loops-integration', {
      body: {
        action: 'triggerEvent',
        userData: {
          email,
          customFields: {
            planType: userGroup,
            timestamp: new Date().toISOString()
          }
        },
        eventName: userGroup === 'free' ? 'plan_downgraded' : 'plan_upgraded'
      }
    });
    
    console.log(`Successfully updated Loops for ${email}`);
    return true;
  } catch (error) {
    console.error('Error updating Loops contact:', error);
    // Don't throw error, as this is not critical for subscription flow
    return false;
  }
}

// Module for health check
const healthService = {
  // Health check endpoint
  handleHealthCheck: (mode) => {
    console.log(`Health check requested in ${mode} mode`);
    return successResponse({ status: 'ok', mode, timestamp: new Date().toISOString() });
  }
};

// Module for pricing information
const pricingService = {
  // Get plans with pricing
  getPlansWithPricing: async (stripe, priceIds, mode) => {
    try {
      console.log(`Fetching plans with pricing from Stripe in ${mode} mode`);
      
      // Get price information from Stripe
      const freelancerPriceId = priceIds.freelancer;
      const proPriceId = priceIds.pro;
      
      if (!freelancerPriceId || !proPriceId) {
        console.error('Missing price IDs in environment variables');
        return errorResponse('Missing Stripe price configuration');
      }
      
      // Fetch prices from Stripe
      const [freelancerPrice, proPrice] = await Promise.all([
        stripe.prices.retrieve(freelancerPriceId),
        stripe.prices.retrieve(proPriceId)
      ]);
      
      console.log('Fetched Stripe prices:', { 
        freelancer: `${freelancerPrice.id} - ${freelancerPrice.unit_amount}`, 
        pro: `${proPrice.id} - ${proPrice.unit_amount}` 
      });
      
      // Format prices for display
      const formatPrice = (price) => {
        const amount = price.unit_amount / 100; // Convert from cents to dollars
        const currency = price.currency.toUpperCase();
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        }).format(amount);
        
        return formatted;
      };
      
      const getPeriod = (price) => {
        if (price.type === 'recurring') {
          switch (price.recurring.interval) {
            case 'month':
              return 'per month';
            case 'year':
              return 'per year';
            default:
              return `per ${price.recurring.interval}`;
          }
        }
        return '';
      };
      
      // Construct plans data with pricing
      const plans = [
        {
          id: 'free',
          price: '$0',
          period: ''
        },
        {
          id: 'freelancer',
          price: formatPrice(freelancerPrice),
          period: getPeriod(freelancerPrice)
        },
        {
          id: 'pro',
          price: formatPrice(proPrice),
          period: getPeriod(proPrice)
        }
      ];
      
      console.log('Returning formatted plans data:', plans);
      return successResponse({ plans, mode });
    } catch (error) {
      console.error('Error fetching plans with pricing:', error);
      return errorResponse(`Error fetching plans with pricing: ${error.message}`);
    }
  }
};

// Module for subscription management
const subscriptionService = {
  // Get current subscription
  getCurrentSubscription: async (supabase, userId, mode) => {
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    console.log(`Getting current subscription for user ${userId} in ${mode} mode`);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "No rows returned"
      console.error('Error fetching subscription:', error);
      return errorResponse('Error fetching subscription');
    }

    // If no subscription found, return free plan
    if (!data) {
      return successResponse({ plan_id: 'free', status: 'active', mode });
    }

    return successResponse({ ...data, mode });
  },
  
  // Cancel subscription
  cancelSubscription: async (stripe, supabase, userId, mode) => {
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    console.log(`Cancelling subscription for user ${userId} in ${mode} mode`);

    // Get the subscription and user email from the database
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return errorResponse('Error fetching subscription');
    }

    if (!subscriptionData?.stripe_subscription_id) {
      return errorResponse('No active subscription found', 400);
    }

    // Get user email for Loops update
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user email:', userError);
      // Continue anyway, as we can still cancel the subscription
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.cancel(subscriptionData.stripe_subscription_id);

    // Update the subscription in the database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        plan_id: 'free'
      })
      .eq('user_id', userId);

    // Update Loops if we have the user email
    if (userData?.email) {
      try {
        await updateLoopsContact(supabase, userData.email, 'free');
      } catch (loopsError) {
        console.error('Error updating Loops after cancellation:', loopsError);
        // Continue anyway as this is not critical
      }
    }

    return successResponse({ success: true, mode });
  },
  
  // Create checkout session
  createCheckoutSession: async (stripe, supabase, userId, planId, origin, priceIds, mode) => {
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    if (!planId) {
      return errorResponse('Plan ID is required', 400);
    }

    console.log(`Creating checkout session for user ${userId}, plan ${planId} in ${mode} mode`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return errorResponse(`Error fetching user profile: ${profileError.message}`);
    }

    if (!profile || !profile.email) {
      console.error('User profile not found or missing email');
      return errorResponse('User profile not found or missing email', 404);
    }

    // Check if user already has a customer ID
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
    }

    let customerId = subscription?.stripe_customer_id;

    // Create a new customer if needed
    if (!customerId) {
      try {
        console.log(`Creating new Stripe customer for user ${userId}`);
        const customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
          metadata: {
            userId: userId
          }
        });
        customerId = customer.id;
        console.log(`Created Stripe customer: ${customerId}`);

        // Save customer ID to database
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            plan_id: 'free',  // Default plan
            status: 'active'
          });

        if (upsertError) {
          console.error('Error saving customer ID to database:', upsertError);
          // Continue anyway as this is not critical
        }
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return errorResponse(`Error creating Stripe customer: ${error.message}`);
      }
    }

    // Determine price ID based on plan
    let priceId;
    if (planId === 'freelancer') {
      priceId = priceIds.freelancer;
    } else if (planId === 'pro') {
      priceId = priceIds.pro;
    }

    if (!priceId) {
      console.error(`Invalid plan or missing price ID for plan: ${planId}`);
      return errorResponse(`Invalid plan or missing price ID for: ${planId}`, 400);
    }

    // Create checkout session
    try {
      console.log(`Creating checkout session with price: ${priceId} for customer: ${customerId}`);
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${origin}/account-settings/plan?success=true`,
        cancel_url: `${origin}/account-settings/plan?canceled=true`,
        subscription_data: {
          metadata: {
            userId: userId,
            planId: planId,
            userEmail: profile.email
          }
        }
      });

      console.log(`Created checkout session: ${session.id}, URL: ${session.url}`);
      return successResponse({ url: session.url, mode });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return errorResponse(`Error creating checkout session: ${error.message}`);
    }
  },
  
  // Create customer portal session
  createCustomerPortalSession: async (stripe, supabase, userId, origin, mode) => {
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    console.log(`Creating customer portal session for user ${userId} in ${mode} mode`);

    // Get the customer ID from the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return errorResponse(`Error fetching subscription: ${subscriptionError.message}`);
    }

    if (!subscription?.stripe_customer_id) {
      console.error('No customer ID found for user:', userId);
      return errorResponse('No active subscription found', 400);
    }

    try {
      // Create a customer portal session
      console.log(`Creating customer portal session for customer ${subscription.stripe_customer_id}`);
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${origin}/account-settings/plan`,
      });

      console.log(`Created customer portal session: ${session.id}, URL: ${session.url}`);
      return successResponse({ url: session.url, mode });
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return errorResponse(`Error creating customer portal session: ${error.message}`);
    }
  }
};

// Module for webhook handling
const webhookService = {
  // Handle webhook events
  handleWebhook: async (stripe, supabase, req, mode) => {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = mode === 'test' 
      ? Deno.env.get('STRIPE_TEST_WEBHOOK_SECRET')
      : Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      return errorResponse('Missing signature or webhook secret', 400);
    }

    const body = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return errorResponse(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    try {
      console.log(`Processing webhook event: ${event.type} in ${mode} mode`);
      
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const subscriptionId = session.subscription;
          const customerId = session.customer;

          // Get metadata from subscription
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.userId;
          const planId = subscription.metadata.planId;
          const userEmail = subscription.metadata.userEmail;

          if (userId && planId) {
            // Update subscription in database
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                plan_id: planId,
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              });
              
            // Update user in Loops if email is available
            if (userEmail) {
              try {
                await updateLoopsContact(supabase, userEmail, planId);
              } catch (loopsError) {
                console.error('Error updating Loops contact after checkout:', loopsError);
                // Continue anyway as this is not critical
              }
            }
          }
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;
          const userEmail = subscription.metadata.userEmail;
          const planId = subscription.metadata.planId;
          
          if (userId) {
            await supabase
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('stripe_subscription_id', subscription.id);
              
            // Update Loops with subscription change if email is available
            if (userEmail && planId && subscription.status === 'active') {
              try {
                await updateLoopsContact(supabase, userEmail, planId);
              } catch (loopsError) {
                console.error('Error updating Loops contact after subscription update:', loopsError);
                // Continue anyway as this is not critical
              }
            }
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userEmail = subscription.metadata.userEmail;
          
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan_id: 'free'
            })
            .eq('stripe_subscription_id', subscription.id);
            
          // Update Loops if email is available  
          if (userEmail) {
            try {
              await updateLoopsContact(supabase, userEmail, 'free');
            } catch (loopsError) {
              console.error('Error updating Loops contact after subscription deletion:', loopsError);
              // Continue anyway as this is not critical
            }
          }
          
          break;
        }
      }
      
      return successResponse({ received: true, mode });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return errorResponse(`Error processing webhook: ${error.message}`);
    }
  }
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log for debugging
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);

    // Parse request body for non-GET requests
    let body = {};
    let mode = 'live'; // Default to live mode
    
    if (req.method !== 'GET') {
      try {
        body = await req.json();
        console.log('Request body:', JSON.stringify(body));
        
        // Extract mode from request body, default to live
        mode = body.mode || 'live';
        console.log(`Using ${mode} mode for Stripe`);
      } catch (error) {
        console.error('Error parsing request body:', error);
        return errorResponse('Invalid request body', 400);
      }
    }
    
    // Health check endpoint
    const url = new URL(req.url);
    if (url.pathname.endsWith('/health')) {
      return healthService.handleHealthCheck(mode);
    }

    // Initialize clients with the specified mode
    const { stripe, supabase, priceIds } = initClients(mode);

    // Extract action and params
    const { action, userId, planId } = body;
    console.log(`Processing ${action || 'unknown'} request for user ${userId || 'unknown'}${planId ? ` and plan ${planId}` : ''} in ${mode} mode`);

    const origin = req.headers.get('origin') || 'https://app.example.com'; // Fallback origin if not provided

    // Route to the appropriate handler based on action
    switch (action) {
      case 'getPlansWithPricing':
        return await pricingService.getPlansWithPricing(stripe, priceIds, mode);
      
      case 'createCustomerPortalSession':
        return await subscriptionService.createCustomerPortalSession(stripe, supabase, userId, origin, mode);
      
      case 'createCheckoutSession':
        return await subscriptionService.createCheckoutSession(stripe, supabase, userId, planId, origin, priceIds, mode);
      
      case 'getCurrentSubscription':
        return await subscriptionService.getCurrentSubscription(supabase, userId, mode);
      
      case 'cancelSubscription':
        return await subscriptionService.cancelSubscription(stripe, supabase, userId, mode);
      
      case 'handleWebhook':
        return await webhookService.handleWebhook(stripe, supabase, req, mode);
      
      default:
        return errorResponse('Unknown action', 400);
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(error.message);
  }
})
