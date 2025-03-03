
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Health check endpoint
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    console.log('Health check requested');
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Log environment variables availability (not their values for security)
    console.log('Environment variables check:');
    console.log('STRIPE_SECRET_KEY available:', !!Deno.env.get('STRIPE_SECRET_KEY'));
    console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'));
    console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    console.log('STRIPE_FREELANCER_PRICE_ID available:', !!Deno.env.get('STRIPE_FREELANCER_PRICE_ID'));
    console.log('STRIPE_PRO_PRICE_ID available:', !!Deno.env.get('STRIPE_PRO_PRICE_ID'));
    
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body for non-GET requests
    let body = {};
    if (req.method !== 'GET') {
      try {
        body = await req.json();
        console.log('Request body:', JSON.stringify(body));
      } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Extract action and params
    const { action, userId, planId } = body;
    console.log(`Processing ${action || 'unknown'} request for user ${userId || 'unknown'}${planId ? ` and plan ${planId}` : ''}`)

    // Create a customer portal session
    if (action === 'createCustomerPortalSession') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the customer ID from the database
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError)
        return new Response(
          JSON.stringify({ error: `Error fetching subscription: ${subscriptionError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!subscription?.stripe_customer_id) {
        console.error('No customer ID found for user:', userId)
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        // Create a customer portal session
        console.log(`Creating customer portal session for customer ${subscription.stripe_customer_id}`)
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: `${req.headers.get('origin')}/account-settings/plan`,
        })

        console.log(`Created customer portal session: ${session.id}, URL: ${session.url}`)
        return new Response(
          JSON.stringify({ url: session.url }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error creating customer portal session:', error)
        return new Response(
          JSON.stringify({ error: `Error creating customer portal session: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create a customer if needed
    if (action === 'createCheckoutSession') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!planId) {
        return new Response(
          JSON.stringify({ error: 'Plan ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return new Response(
          JSON.stringify({ error: `Error fetching user profile: ${profileError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!profile || !profile.email) {
        console.error('User profile not found or missing email')
        return new Response(
          JSON.stringify({ error: 'User profile not found or missing email' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user already has a customer ID
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError)
      }

      let customerId = subscription?.stripe_customer_id

      // Create a new customer if needed
      if (!customerId) {
        try {
          console.log(`Creating new Stripe customer for user ${userId}`)
          const customer = await stripe.customers.create({
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
            metadata: {
              userId: userId
            }
          })
          customerId = customer.id
          console.log(`Created Stripe customer: ${customerId}`)

          // Save customer ID to database
          const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              plan_id: 'free',  // Default plan
              status: 'active'
            })

          if (upsertError) {
            console.error('Error saving customer ID to database:', upsertError)
            // Continue anyway as this is not critical
          }
        } catch (error) {
          console.error('Error creating Stripe customer:', error)
          return new Response(
            JSON.stringify({ error: `Error creating Stripe customer: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Determine price ID based on plan
      let priceId
      if (planId === 'freelancer') {
        priceId = Deno.env.get('STRIPE_FREELANCER_PRICE_ID')
      } else if (planId === 'pro') {
        priceId = Deno.env.get('STRIPE_PRO_PRICE_ID')
      }

      if (!priceId) {
        console.error(`Invalid plan or missing price ID for plan: ${planId}`)
        return new Response(
          JSON.stringify({ error: `Invalid plan or missing price ID for: ${planId}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create checkout session
      try {
        console.log(`Creating checkout session with price: ${priceId} for customer: ${customerId}`)
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1
            }
          ],
          mode: 'subscription',
          success_url: `${req.headers.get('origin')}/account-settings/plan?success=true`,
          cancel_url: `${req.headers.get('origin')}/account-settings/plan?canceled=true`,
          subscription_data: {
            metadata: {
              userId: userId,
              planId: planId
            }
          }
        })

        console.log(`Created checkout session: ${session.id}, URL: ${session.url}`)
        return new Response(
          JSON.stringify({ url: session.url }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error creating checkout session:', error)
        return new Response(
          JSON.stringify({ error: `Error creating checkout session: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get current subscription
    if (action === 'getCurrentSubscription') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status:
            400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "No rows returned"
        console.error('Error fetching subscription:', error)
        return new Response(
          JSON.stringify({ error: 'Error fetching subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If no subscription found, return free plan
      if (!data) {
        return new Response(
          JSON.stringify({ plan_id: 'free', status: 'active' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cancel subscription
    if (action === 'cancelSubscription') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get the subscription from the database
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single()

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError)
        return new Response(
          JSON.stringify({ error: 'Error fetching subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!subscriptionData?.stripe_subscription_id) {
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Cancel the subscription in Stripe
      const subscription = await stripe.subscriptions.cancel(subscriptionData.stripe_subscription_id)

      // Update the subscription in the database
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          plan_id: 'free'
        })
        .eq('user_id', userId)

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle webhook event
    if (action === 'handleWebhook') {
      const signature = req.headers.get('stripe-signature')
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
      
      if (!signature || !webhookSecret) {
        return new Response(
          JSON.stringify({ error: 'Missing signature or webhook secret' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const body = await req.text()
      
      let event
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object
          const subscriptionId = session.subscription
          const customerId = session.customer

          // Get metadata from subscription
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata.userId
          const planId = subscription.metadata.planId

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
              })
          }
          break
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object
          const userId = subscription.metadata.userId
          
          if (userId) {
            await supabase
              .from('subscriptions')
              .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq('stripe_subscription_id', subscription.id)
          }
          break
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object
          
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan_id: 'free'
            })
            .eq('stripe_subscription_id', subscription.id)
          
          break
        }
      }

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default response for unknown actions
    return new Response(
      JSON.stringify({ error: 'Unknown action', receivedAction: action }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
