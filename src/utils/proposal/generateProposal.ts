
import { supabase } from '@/integrations/supabase/client';
import { ProposalInput, ProposalSection } from '@/types/proposal';

export async function generateProposal(input: ProposalInput): Promise<ProposalSection[]> {
  try {
    const { projectDescription, hourlyRate, projectType } = input;
    
    const response = await supabase.functions.invoke('generate-proposal', {
      body: {
        prompt: `Create a detailed proposal for this project:
Project Type: ${projectType}
Hourly Rate: $${hourlyRate}
Project Description: ${projectDescription}`,
        hourlyRate,
      }
    });

    if (response.error) {
      console.error('Error generating proposal:', response.error);
      throw new Error('Failed to generate proposal');
    }

    const data = response.data;
    
    if (!data || !data.sections) {
      throw new Error('Invalid response format from AI');
    }

    return data.sections;
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
}
