
import { supabase } from '@/integrations/supabase/client';
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
    // Make the API call to our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-proposal', {
      body: { input: enrichedInput },
      // No responseType option for streaming - will handle manually
    });

    if (error) {
      console.error('Error calling generate-proposal function:', error);
      throw new Error(`Failed to generate proposal: ${error.message}`);
    }

    // If we have data and it's not streaming, just return it
    if (data && Array.isArray(data)) {
      return data;
    }

    // If the data isn't in the expected format, throw an error
    throw new Error('Invalid response from the generate-proposal function');
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
        .select('knowledge_base, services')
        .eq('id', user.id)
        .single();
        
      if (profile.data) {
        knowledgeBase = profile.data.knowledge_base || '';
        userServices = profile.data.services || [];
        console.log('Loaded knowledge base and services for proposal generation');
      }
    }
  } catch (error) {
    console.error('Error fetching user profile for proposal generation:', error);
    // Continue with generation even if we can't get the knowledge base
  }
  
  return { knowledgeBase, userServices };
};
