
import { supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import { ProposalInput, ProposalSection } from '@/types/proposal';

// Function to parse streaming response data
export const parseStreamData = (data: string): ProposalSection[] => {
  try {
    // Remove the "data: " prefix if it exists
    const cleanData = data.startsWith('data: ') ? data.slice(6) : data;

    // Parse the JSON data
    return JSON.parse(cleanData);
  } catch (error) {
    console.error('Error parsing stream data:', error);
    return [];
  }
};

// Function to call the generate-proposal edge function
export const callGenerateProposalFunction = async (
  enrichedInput: any,
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session found');
    }

    // Make the API call to our Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        prompt: enrichedInput.projectDescription,
        hourlyRate: enrichedInput.hourlyRate,
        projectBudget: enrichedInput.projectBudget,
        freelancerRate: enrichedInput.freelancerRate,
        knowledgeBase: enrichedInput.knowledgeBase,
        userServices: enrichedInput.userServices,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate proposal: ${errorText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    let buffer = '';
    let sections: ProposalSection[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Convert the chunk to text
      const chunk = new TextDecoder().decode(value);
      buffer += chunk;

      // Process each line in the buffer
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;

        // Extract the JSON data from the line
        const jsonStr = line.replace(/^data: /, '');
        if (jsonStr === '[DONE]') break;

        try {
          const data = JSON.parse(jsonStr);
          if (data.sections) {
            sections = data.sections;
            if (onStreamUpdate) {
              onStreamUpdate(sections); // Call the callback with the latest sections
            }
          }
        } catch (e) {
          console.error('Failed to parse chunk:', jsonStr);
        }
      }
    }

    return sections;
  } catch (error) {
    console.error('Error in callGenerateProposalFunction:', error);
    throw error;
  }
};

// Function to fetch user profile data for proposal generation
export const fetchUserProfileForProposal = async (): Promise<{
  knowledgeBase: string,
  userServices: string[]
}> => {
  let knowledgeBase = '';
  let userServices: string[] = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await supabase
        .from('profiles')
        .select(`
          knowledge_base, 
          services,
          organization_id,
          organizations:organization_id (
            knowledge_base,
            services
          )
        `)
        .eq('id', user.id)
        .single();

      if (profile.data) {
        // Prioritize organization data if available
        if (profile.data.organizations && profile.data.organization_id) {
          // Fix the TypeScript error by accessing as an object with the correct type
          if (profile.data.organizations) {
            const orgData = profile.data.organizations as unknown as {
              knowledge_base: string;
              services: string[]
            };

            knowledgeBase = orgData.knowledge_base || '';
            userServices = orgData.services || [];
            console.log('Loaded organization knowledge base and services for proposal generation');
          }
        } else {
          // Fall back to profile data
          knowledgeBase = profile.data.knowledge_base || '';
          userServices = profile.data.services || [];
          console.log('Loaded user knowledge base and services for proposal generation');
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user profile for proposal generation:', error);
    // Continue with generation even if we can't get the knowledge base
  }

  return { knowledgeBase, userServices };
};
