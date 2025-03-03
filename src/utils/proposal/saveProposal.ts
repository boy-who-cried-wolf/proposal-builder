
import { supabase } from '@/integrations/supabase/client';
import { SaveProposalInput } from '@/types/proposal';

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
