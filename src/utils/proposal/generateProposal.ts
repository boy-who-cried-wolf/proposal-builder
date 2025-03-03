
import { supabase } from '@/integrations/supabase/client';
import { ProposalInput, ProposalSection } from '@/types/proposal';
import { format } from 'date-fns';

export async function generateProposal(input: ProposalInput): Promise<ProposalSection[]> {
  try {
    const { projectDescription, hourlyRate, projectType, projectBudget, dateRange } = input;
    
    let dateRangeText = '';
    if (dateRange?.from) {
      const fromDate = format(dateRange.from, 'MMMM d, yyyy');
      const toDate = dateRange.to ? format(dateRange.to, 'MMMM d, yyyy') : '';
      dateRangeText = toDate ? `${fromDate} to ${toDate}` : `Starting on ${fromDate}`;
    }
    
    const response = await supabase.functions.invoke('generate-proposal', {
      body: {
        prompt: `Create a detailed proposal for this project:
Project Type: ${projectType}
Hourly Rate: $${hourlyRate}
Project Budget: ${projectBudget ? '$' + projectBudget : 'Not specified'}
Timeline: ${dateRangeText || 'Not specified'}
Project Description: ${projectDescription}`,
        hourlyRate,
        projectBudget,
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
