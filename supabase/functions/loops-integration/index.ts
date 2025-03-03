
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define interfaces for typechecking
interface LoopsUser {
  email: string;
  userGroup?: string;
  source?: string;
  customFields?: Record<string, any>;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

interface LoopsRequest {
  action: "createContact" | "updateContact" | "triggerEvent" | "passwordReset" | "sendTransactional";
  userData: LoopsUser;
  eventName?: string;
  transactionalId?: string;
}

// Common response helpers
const responseHelpers = {
  error: (message, status = 500, details = null) => {
    console.error(`Error: ${message}`, details || '');
    return new Response(
      JSON.stringify({ error: message, details }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
    );
  },
  
  success: (data) => {
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Contact management service
const contactService = {
  // Create a new contact in Loops
  createContact: async (userData, apiKey) => {
    console.log(`Creating contact in Loops for ${userData.email}`);
    
    const body = {
      email: userData.email,
      ...userData.userGroup && { userGroup: userData.userGroup },
      ...userData.source && { source: userData.source },
      ...userData.firstName && { firstName: userData.firstName },
      ...userData.lastName && { lastName: userData.lastName },
      ...userData.customFields && { ...userData.customFields }
    };
    
    return await callLoopsApi("https://app.loops.so/api/v1/contacts/create", body, apiKey);
  },
  
  // Update an existing contact in Loops
  updateContact: async (userData, apiKey) => {
    console.log(`Updating contact in Loops for ${userData.email}`);
    
    const body = {
      email: userData.email,
      ...userData.userGroup && { userGroup: userData.userGroup },
      ...userData.customFields && { ...userData.customFields }
    };
    
    return await callLoopsApi("https://app.loops.so/api/v1/contacts/update", body, apiKey);
  }
};

// Event service
const eventService = {
  // Trigger a custom event in Loops
  triggerEvent: async (userData, eventName, apiKey) => {
    console.log(`Triggering "${eventName}" event in Loops for ${userData.email}`);
    
    const body = {
      email: userData.email,
      eventName,
      ...userData.customFields && { properties: userData.customFields }
    };
    
    return await callLoopsApi("https://app.loops.so/api/v1/events/send", body, apiKey);
  },
  
  // Trigger a password reset event in Loops
  triggerPasswordReset: async (userData, apiKey) => {
    console.log(`Triggering password reset event in Loops for ${userData.email}`);
    
    return await eventService.triggerEvent(
      userData, 
      "password_reset_requested", 
      apiKey
    );
  }
};

// Transactional email service
const emailService = {
  // Send a transactional email via Loops
  sendTransactional: async (userData, transactionalId, apiKey) => {
    console.log(`Sending transactional email (${transactionalId}) for ${userData.email}`);
    
    const body = {
      email: userData.email,
      transactionalId,
      dataVariables: userData.customFields || {}
    };
    
    console.log("Transactional email body:", JSON.stringify(body));
    
    return await callLoopsApi("https://app.loops.so/api/v1/transactional", body, apiKey);
  }
};

// Helper function to call Loops API
async function callLoopsApi(endpoint, body, apiKey) {
  console.log(`Calling Loops API at: ${endpoint}`);
  console.log(`Request body:`, JSON.stringify(body));
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Get the response text first
    const responseText = await response.text();
    console.log("Raw response text:", responseText);
    
    // Try to parse as JSON if not empty
    let responseData = {};
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Failed to parse response: ${responseText}`, parseError);
        responseData = { 
          rawResponse: responseText,
          parseError: parseError.message 
        };
      }
    } else {
      responseData = { message: "Empty response received" };
    }
    
    console.log("Parsed response data:", JSON.stringify(responseData));

    if (!response.ok) {
      throw new Error(`Loops API error: ${response.status} ${response.statusText}`);
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error(`Error calling Loops API: ${error.message}`);
    throw error;
  }
}

// Main request handler
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
      return responseHelpers.error("LOOPS_API_KEY is not set", 500);
    }

    // Safely parse the request body
    let requestData: LoopsRequest;
    let requestBody: string;
    
    try {
      requestBody = await req.text();
      console.log("Request body raw:", requestBody);
      
      if (!requestBody || requestBody.trim() === "") {
        console.error("Empty request body received");
        return responseHelpers.error("Empty request body", 400);
      }
      
      requestData = JSON.parse(requestBody) as LoopsRequest;
      console.log("Request data parsed:", JSON.stringify(requestData));
    } catch (jsonError) {
      console.error("Failed to parse request JSON:", jsonError, "Raw request body:", requestBody);
      return responseHelpers.error(`Invalid JSON in request body: ${jsonError.message}`, 400, { rawBody: requestBody });
    }

    // Validate required fields
    if (!requestData.action) {
      console.error("Missing action in request");
      return responseHelpers.error("Missing action in request", 400);
    }
    
    if (!requestData.userData || !requestData.userData.email) {
      console.error("Missing email in request userData");
      return responseHelpers.error("Missing email in request userData", 400);
    }

    const { action, userData, eventName, transactionalId } = requestData;
    console.log(`Processing ${action} for user: ${userData.email}`);

    // Process the request based on the action
    let result;
    
    try {
      switch (action) {
        case "createContact":
          result = await contactService.createContact(userData, LOOPS_API_KEY);
          break;
        
        case "updateContact":
          result = await contactService.updateContact(userData, LOOPS_API_KEY);
          break;
        
        case "triggerEvent":
          if (!eventName) {
            return responseHelpers.error("eventName is required for triggerEvent action", 400);
          }
          result = await eventService.triggerEvent(userData, eventName, LOOPS_API_KEY);
          break;
        
        case "passwordReset":
          result = await eventService.triggerPasswordReset(userData, LOOPS_API_KEY);
          break;
        
        case "sendTransactional":
          if (!transactionalId) {
            return responseHelpers.error("transactionalId is required for sendTransactional action", 400);
          }
          result = await emailService.sendTransactional(userData, transactionalId, LOOPS_API_KEY);
          break;
        
        default:
          return responseHelpers.error(`Unsupported action: ${action}`, 400);
      }
      
      return responseHelpers.success(result.data);
    } catch (error) {
      console.error(`Error processing ${action} request:`, error);
      return responseHelpers.error(error.message, 500);
    }
  } catch (error) {
    console.error(`Error in Loops integration:`, error.message, error.stack);
    return responseHelpers.error(error.message, 500, { stack: error.stack });
  }
};

serve(handler);
