
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `
You are a creative freelancer proposal assistant. Generate a structured, professional proposal based on the project description.

Follow these rules:
1. Do NOT include introduction or terms sections as billable items. Keep these in a separate notes section if needed.
2. Only billable tasks should be included in the main sections.
3. Break down the project into logical sections based on offerings (Design, Development, Content, etc.)
4. Itemize tasks within each section - each item must be a concrete, billable deliverable
5. Estimate the hours required per task based on industry best practices
6. Calculate the cost by multiplying hours by the provided hourly rate
7. Return the proposal in JSON format exactly as specified below

Format your response as a JSON object with this structure:
{
  "sections": [
    {
      "title": "Section Title (e.g. Design)",
      "items": [
        {
          "item": "Task Name",
          "description": "Brief task description",
          "hours": "Estimated hours (numeric string)",
          "price": "Price as formatted string with $ sign"
        }
      ],
      "subtotal": "Subtotal price as formatted string with $ sign"
    }
  ]
}

IMPORTANT: General information like introductions or terms and conditions should NOT be included as billable items with hours and prices. Focus only on concrete, billable deliverables for the main section items.
`;

// Helper function to parse streaming OpenAI response chunks
function parseStreamChunk(chunk) {
  // Remove the "data: " prefix
  const jsonStr = chunk.replace(/^data: /, '');
  
  // Return empty for "[DONE]" messages
  if (jsonStr === '[DONE]') return null;
  
  try {
    const json = JSON.parse(jsonStr);
    return json;
  } catch (e) {
    console.error('Failed to parse chunk:', jsonStr);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, hourlyRate, projectBudget, freelancerRate, knowledgeBase, userServices } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Setup streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Start the response
    const response = new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
    // Initialize the full response object
    let fullSections = [];
    let currentSection = null;
    let buffer = "";
    
    // Build the system prompt with knowledge base if available
    let enhancedSystemPrompt = systemPrompt;
    
    if (knowledgeBase && knowledgeBase.trim()) {
      enhancedSystemPrompt += `\n\nAdditional context about the service provider:\n${knowledgeBase}\n\nImportant: Use this information to enhance your proposal but do NOT deviate from the required structure or rules above. The structure requirements above take precedence over any conflicting information in this additional context.`;
    }
    
    if (userServices && userServices.length > 0) {
      enhancedSystemPrompt += `\n\nThe service provider specializes in: ${userServices.join(', ')}. Consider these services when creating the proposal structure if applicable to the project.`;
    }
    
    // Start the OpenAI request
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        stream: true,
      }),
    }).then(async (aiResponse) => {
      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`OpenAI API error: ${aiResponse.status} ${errorText}`);
      }
      
      const reader = aiResponse.body?.getReader();
      if (!reader) throw new Error('Failed to get reader from response');
      
      let jsonData = { sections: [] };
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert bytes to text
        const chunk = new TextDecoder().decode(value);
        
        // Split by lines and process each
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;
          
          const parsed = parseStreamChunk(line);
          if (!parsed || !parsed.choices || !parsed.choices[0]) continue;
          
          const delta = parsed.choices[0].delta;
          if (!delta || !delta.content) continue;

          // Append to buffer
          buffer += delta.content;
          
          // Try to parse the buffer as JSON when we see a closing brace
          if (buffer.includes('}')) {
            try {
              // Look for complete JSON objects in the buffer
              const match = buffer.match(/\{[\s\S]*\}/);
              if (match) {
                const jsonStr = match[0];
                const partialData = JSON.parse(jsonStr);
                
                if (partialData.sections) {
                  // We have a complete or partial sections array
                  jsonData = partialData;
                  
                  // Send the update to the client
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ sections: jsonData.sections })}\n\n`));
                  
                  // Clear the buffer after successful parse
                  buffer = buffer.replace(jsonStr, '');
                }
              }
            } catch (e) {
              // Not a complete JSON object yet, continue collecting
              console.log("Incomplete JSON, continuing to collect");
            }
          }
        }
      }
      
      // Send final data and close
      await writer.write(encoder.encode('data: [DONE]\n\n'));
      await writer.close();
      
    }).catch(async (error) => {
      console.error('Error processing stream:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
      await writer.close();
    });
    
    return response;
    
  } catch (error) {
    console.error('Error in generate-proposal function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
