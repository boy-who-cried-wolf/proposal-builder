
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoopsUser {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  userGroup?: string; // e.g., "free", "premium"
  source?: string;
  customFields?: Record<string, string | number | boolean>;
}

interface LoopsRequest {
  action: "createContact" | "updateContact" | "triggerEvent" | "passwordReset";
  userData: LoopsUser;
  eventName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    if (!LOOPS_API_KEY) {
      throw new Error("LOOPS_API_KEY is not set");
    }

    const { action, userData, eventName } = await req.json() as LoopsRequest;
    console.log(`Processing ${action} for user: ${userData.email}`);

    let endpoint = "";
    let method = "POST";
    let body: any = {};

    switch (action) {
      case "createContact":
        endpoint = "https://app.loops.so/api/v1/contacts/create";
        body = userData;
        break;
      
      case "updateContact":
        endpoint = "https://app.loops.so/api/v1/contacts/update";
        body = userData;
        break;
      
      case "triggerEvent":
        if (!eventName) {
          throw new Error("eventName is required for triggerEvent action");
        }
        endpoint = "https://app.loops.so/api/v1/events/send";
        body = {
          email: userData.email,
          eventName,
          ...userData.customFields && { properties: userData.customFields }
        };
        break;
      
      case "passwordReset":
        // For password reset, we'll trigger a specific event in Loops
        endpoint = "https://app.loops.so/api/v1/events/send";
        body = {
          email: userData.email,
          eventName: "password_reset_requested",
          ...userData.customFields && { properties: userData.customFields }
        };
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Making request to Loops: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Error from Loops API:", responseData);
      throw new Error(`Loops API error: ${response.status} ${JSON.stringify(responseData)}`);
    }

    console.log("Successful response from Loops API:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in loops-integration function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
