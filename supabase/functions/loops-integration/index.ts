
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

const handler = async (req: Request): Promise<Response> => {
  try {
    // Set CORS headers for all responses
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    // Get Loops API key from environment variable
    const LOOPS_API_KEY = Deno.env.get("LOOPS_API_KEY");
    if (!LOOPS_API_KEY) {
      throw new Error("LOOPS_API_KEY is not set");
    }

    const { action, userData, eventName, transactionalId } = await req.json() as LoopsRequest;
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
        endpoint = "https://app.loops.so/api/v1/events/send";
        body = {
          email: userData.email,
          eventName: "password_reset_requested",
          ...userData.customFields && { properties: userData.customFields }
        };
        break;
      
      case "sendTransactional":
        if (!transactionalId) {
          throw new Error("transactionalId is required for sendTransactional action");
        }
        endpoint = "https://app.loops.so/api/v1/transactional";
        body = {
          email: userData.email,
          transactionalId,
          ...userData.customFields && { dataFields: userData.customFields }
        };
        break;
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Call Loops API
    console.log(`Calling Loops API at: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Loops API error: ${response.status} ${response.statusText}`, errorData);
      return new Response(
        JSON.stringify({ error: `Loops API error: ${response.status} ${response.statusText}` }),
        { headers: { ...headers, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Loops API response:`, data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error in Loops integration:`, error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
