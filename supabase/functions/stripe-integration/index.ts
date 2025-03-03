
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.11.0'

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Common response helpers
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

// Initialize clients
const initializeClients = () => {
  // Initialize Stripe
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

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

  return { stripe, supabase };
}

// Health check endpoint
const handleHealthCheck = () => {
  console.log('Health check requested');
  return successResponse({ status: 'ok', timestamp: new Date().toISOString() });
}

// Customer Portal Session creation
const createCustomerPortalSession = async (stripe, supabase, userId, origin) => {
  if (!userId) {
    return errorResponse('User ID is required', 400);
  }

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
    return successResponse({ url: session.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return errorResponse(`Error creating customer portal session: ${error.message}`);
  }
}

// Checkout Session creation
const createCheckoutSession = async (stripe, supabase, userId, planId, origin) => {
  if (!userId) {
    return errorResponse('User ID is required', 400);
  }

  if (!planId) {
    return errorResponse('Plan ID is required', 400);
  }

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
    priceId = Deno.env.get('STRIPE_FREELANCER_PRICE_ID');
  } else if (planId === 'pro') {
    priceId = Deno.env.get('STRIPE_PRO_PRICE_ID');
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
          planId: planId
        }
      }
    });

    console.log(`Created checkout session: ${session.id}, URL: ${session.url}`);
    return successResponse({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return errorResponse(`Error creating checkout session: ${error.message}`);
  }
}

// Get current subscription
const getCurrentSubscription = async (supabase, userId) => {
  if (!userId) {
    return errorResponse('User ID is required', 400);
  }

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
    return successResponse({ plan_id: 'free', status: 'active' });
  }

  return successResponse(data);
}

// Cancel subscription
const cancelSubscription = async (stripe, supabase, userId) => {
  if (!userId) {
    return errorResponse('User ID is required', 400);
  }

  // Get the subscription from the database
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

  return successResponse({ success: true });
}

// Handle webhook events
const handleWebhook = async (stripe, supabase, req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Get metadata from subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.userId;
        const planId = subscription.metadata.planId;

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
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;
        
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_id: 'free'
          })
          .eq('stripe_subscription_id', subscription.id);
        
        break;
      }
    }
    
    return successResponse({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return errorResponse(`Error processing webhook: ${error.message}`);
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    return handleHealthCheck();
  }

  try {
    // Log environment variables availability (not their values for security)
    console.log('Environment variables check:');
    console.log('STRIPE_SECRET_KEY available:', !!Deno.env.get('STRIPE_SECRET_KEY'));
    console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'));
    console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    console.log('STRIPE_FREELANCER_PRICE_ID available:', !!Deno.env.get('STRIPE_FREELANCER_PRICE_ID'));
    console.log('STRIPE_PRO_PRICE_ID available:', !!Deno.env.get('STRIPE_PRO_PRICE_ID'));
    
    // Initialize clients
    const { stripe, supabase } = initializeClients();

    // Parse request body for non-GET requests
    let body = {};
    if (req.method !== 'GET') {
      try {
        body = await req.json();
        console.log('Request body:', JSON.stringify(body));
      } catch (error) {
        console.error('Error parsing request body:', error);
        return errorResponse('Invalid request body', 400);
      }
    }

    // Extract action and params
    const { action, userId, planId } = body;
    console.log(`Processing ${action || 'unknown'} request for user ${userId || 'unknown'}${planId ? ` and plan ${planId}` : ''}`);

    const origin = req.headers.get('origin');

    // Route to the appropriate handler based on action
    switch (action) {
      case 'createCustomerPortalSession':
        return await createCustomerPortalSession(stripe, supabase, userId, origin);
      
      case 'createCheckoutSession':
        return await createCheckoutSession(stripe, supabase, userId, planId, origin);
      
      case 'getCurrentSubscription':
        return await getCurrentSubscription(supabase, userId);
      
      case 'cancelSubscription':
        return await cancelSubscription(stripe, supabase, userId);
      
      case 'handleWebhook':
        return await handleWebhook(stripe, supabase, req);
      
      default:
        return errorResponse('Unknown action', 400);
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(error.message);
  }
})
