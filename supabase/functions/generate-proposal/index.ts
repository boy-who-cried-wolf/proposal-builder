
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
1. Break down the project into logical sections based on offerings (Design, Development, Content, etc.)
2. Itemize tasks within each section
3. Estimate the hours required per task based on industry best practices
4. Calculate the cost by multiplying hours by the provided hourly rate
5. Return the proposal in JSON format exactly as specified below

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
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, hourlyRate } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }

    const generatedContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response if needed
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedContent;
      parsedResponse = JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON response:', e, 'Raw response:', generatedContent);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-proposal function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
