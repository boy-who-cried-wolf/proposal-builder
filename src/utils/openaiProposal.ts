
import { supabase } from '@/integrations/supabase/client';

export interface ProposalSection {
  title: string;
  items: ProposalItem[];
  subtotal: string;
}

export interface ProposalItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

export interface ProposalInput {
  projectDescription: string;
  hourlyRate: number;
  projectType: string;
}

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
