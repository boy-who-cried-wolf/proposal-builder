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

export interface SaveProposalInput {
  title: string;
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
  sections: ProposalSection[];
}

export interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  items: ProposalItem[];
  user_id: string;
  created_at: string;
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

export async function saveProposal(input: SaveProposalInput): Promise<{ success: boolean, id?: string, error?: string }> {
  try {
    const { title, projectDescription, projectType, hourlyRate, sections } = input;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'User must be logged in to save proposals' };
    }
    
    console.log('Attempting to save proposal for user:', user.id);
    
    // Begin the transaction by inserting the proposal
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        title,
        project_description: projectDescription,
        project_type: projectType,
        hourly_rate: hourlyRate,
        user_id: user.id
      })
      .select('id')
      .single();
    
    if (proposalError || !proposalData) {
      console.error('Error saving proposal:', proposalError);
      return { success: false, error: proposalError?.message || 'Failed to save proposal' };
    }
    
    const proposalId = proposalData.id;
    console.log('Proposal saved with ID:', proposalId);
    
    // Save each section and its items
    for (const section of sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('proposal_sections')
        .insert({
          proposal_id: proposalId,
          title: section.title,
          subtotal: section.subtotal
        })
        .select('id')
        .single();
      
      if (sectionError || !sectionData) {
        console.error('Error saving section:', sectionError);
        continue; // Continue with the next section even if this one fails
      }
      
      const sectionId = sectionData.id;
      console.log('Section saved with ID:', sectionId);
      
      // Save each item in the section
      for (const item of section.items) {
        const { error: itemError } = await supabase
          .from('proposal_items')
          .insert({
            section_id: sectionId,
            item: item.item,
            description: item.description,
            hours: item.hours,
            price: item.price
          });
        
        if (itemError) {
          console.error('Error saving item:', itemError);
          // Continue with the next item even if this one fails
        }
      }
    }
    
    return { success: true, id: proposalId };
  } catch (error) {
    console.error('Error in saveProposal:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error saving proposal' 
    };
  }
}

export async function getSectionTemplates(): Promise<SectionTemplate[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('section_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching section templates:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSectionTemplates:', error);
    return [];
  }
}
