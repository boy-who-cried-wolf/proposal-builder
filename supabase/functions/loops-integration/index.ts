
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
    console.log("Loops integration function called");
    
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      console.log("Handling OPTIONS request");
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
    let requestBody: string;
    
    try {
      requestBody = await req.text();
      console.log("Request body raw:", requestBody);
      
      if (!requestBody || requestBody.trim() === "") {
        console.error("Empty request body received");
        return new Response(
          JSON.stringify({ error: "Empty request body" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      requestData = JSON.parse(requestBody) as LoopsRequest;
      console.log("Request data parsed:", JSON.stringify(requestData));
    } catch (jsonError) {
      console.error("Failed to parse request JSON:", jsonError, "Raw request body:", requestBody);
      return new Response(
        JSON.stringify({ error: `Invalid JSON in request body: ${jsonError.message}`, rawBody: requestBody }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.action) {
      console.error("Missing action in request");
      return new Response(
        JSON.stringify({ error: "Missing action in request" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!requestData.userData || !requestData.userData.email) {
      console.error("Missing email in request userData");
      return new Response(
        JSON.stringify({ error: "Missing email in request userData" }),
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
        
        console.log("Preparing sendTransactional request body");
        
        // For transactional emails, Loops requires dataVariables instead of dataFields
        endpoint = "https://app.loops.so/api/v1/transactional";
        body = {
          email: userData.email,
          transactionalId,
          dataVariables: userData.customFields || {}
        };
        
        console.log("Transactional email body:", JSON.stringify(body));
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
      console.log("Raw response text:", responseText);
      
      // Try to parse as JSON if not empty
      if (responseText.trim()) {
        responseData = JSON.parse(responseText);
      } else {
        responseData = { message: "Empty response received" };
      }
      
      console.log("Parsed response data:", JSON.stringify(responseData));
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

    console.log(`Loops API response success:`, JSON.stringify(responseData));

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error in Loops integration:`, error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
