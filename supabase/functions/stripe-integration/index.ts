
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

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { action, userId, planId } = await req.json()

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
          JSON.stringify({ error: 'Error fetching user profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user already has a customer ID
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      let customerId = subscription?.stripe_customer_id

      // Create a new customer if needed
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
          metadata: {
            userId: userId
          }
        })
        customerId = customer.id

        // Save customer ID to database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            plan_id: 'free',  // Default plan
            status: 'active'
          })
      }

      // Determine price ID based on plan
      let priceId
      if (planId === 'freelancer') {
        priceId = Deno.env.get('STRIPE_FREELANCER_PRICE_ID')
      } else if (planId === 'pro') {
        priceId = Deno.env.get('STRIPE_PRO_PRICE_ID')
      }

      if (!priceId) {
        return new Response(
          JSON.stringify({ error: 'Invalid plan or missing price ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create checkout session
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

      return new Response(
        JSON.stringify({ url: session.url }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
      JSON.stringify({ error: 'Unknown action' }),
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
