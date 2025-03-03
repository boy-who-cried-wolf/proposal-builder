
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define interfaces for typechecking
interface LoopsUser {
  email: string;
  userGroup?: string;
  source?: string;
  customFields?: Record<string, any>;
  fullName?: string;
}

interface LoopsEvent {
  email: string;
  eventName: string;
  properties?: Record<string, any>;
}

interface LoopsTransactional {
  email: string;
  transactionalId: string;
  dataFields?: Record<string, any>;
}

interface LoopsRequest {
  action: "createContact" | "updateContact" | "triggerEvent" | "passwordReset" | "sendTransactional";
  userData: LoopsUser;
  eventName?: string;
  transactionalId?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Get Loops API key from environment variable
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    if (!LOOPS_API_KEY) {
      console.error("LOOPS_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "LOOPS_API_KEY is not set" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Safely parse the request body
    let requestData: LoopsRequest;
    try {
      requestData = await req.json() as LoopsRequest;
    } catch (jsonError) {
      console.error("Failed to parse request JSON:", jsonError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { action, userData, eventName, transactionalId } = requestData;
    console.log(`Processing ${action} for user: ${userData.email}`);

    let endpoint = "";
    let body: Record<string, any> = {};

    switch (action) {
      case "createContact":
        endpoint = "https://app.loops.so/api/v1/contacts/create";
        body = {
          email: userData.email,
          ...userData.userGroup && { userGroup: userData.userGroup },
          ...userData.source && { source: userData.source },
          ...userData.fullName && { firstName: userData.fullName },
          ...userData.customFields && { ...userData.customFields }
        };
        break;
      
      case "updateContact":
        endpoint = "https://app.loops.so/api/v1/contacts/update";
        body = {
          email: userData.email,
          ...userData.userGroup && { userGroup: userData.userGroup },
          ...userData.customFields && { ...userData.customFields }
        };
        break;
      
      case "triggerEvent":
        if (!eventName) {
          return new Response(
            JSON.stringify({ error: "eventName is required for triggerEvent action" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        endpoint = "https://app.loops.so/api/v1/events/send";
        body = {
          email: userData.email,
          eventName,
          ...userData.customFields && { properties: userData.customFields }
        };
        break;
      
      case "passwordReset":
        endpoint = "https://app.loops.so/api/v1/events/send";
        body = {
          email: userData.email,
          eventName: "password_reset_requested",
          ...userData.customFields && { properties: userData.customFields }
        };
        break;
      
      case "sendTransactional":
        if (!transactionalId) {
          return new Response(
            JSON.stringify({ error: "transactionalId is required for sendTransactional action" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        endpoint = "https://app.loops.so/api/v1/transactional";
        body = {
          email: userData.email,
          transactionalId,
          ...userData.customFields && { dataFields: userData.customFields }
        };
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported action: ${action}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }

    // Call Loops API
    console.log(`Calling Loops API at: ${endpoint}`);
    console.log(`Request body:`, JSON.stringify(body));
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Parse response body safely
    let responseData: any;
    let responseText: string;

    try {
      // First get the response as text
      responseText = await response.text();
      
      // Try to parse as JSON if not empty
      if (responseText.trim()) {
        responseData = JSON.parse(responseText);
      } else {
        responseData = { message: "Empty response received" };
      }
    } catch (parseError) {
      console.error(`Failed to parse response: ${responseText}`, parseError);
      responseData = { 
        rawResponse: responseText,
        parseError: parseError.message 
      };
    }

    if (!response.ok) {
      console.error(`Loops API error: ${response.status} ${response.statusText}`, responseData);
      return new Response(
        JSON.stringify({ 
          error: `Loops API error: ${response.status} ${response.statusText}`,
          details: responseData
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    console.log(`Loops API response:`, responseData);

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error in Loops integration:`, error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
