import { supabase } from '@/integrations/supabase/client';
import { ProposalSection } from '@/types/proposal';
import { format } from 'date-fns';
import { recalculateSubtotals, adjustSectionsToMatchBudget } from './sectionManagement';

export async function generateProposal(
  input: any, 
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> {
  try {
    const { projectDescription, hourlyRate, projectType, projectBudget, dateRange, freelancerRate } = input;
    
    let dateRangeText = '';
    if (dateRange?.from) {
      const fromDate = format(dateRange.from, 'MMMM d, yyyy');
      const toDate = dateRange.to ? format(dateRange.to, 'MMMM d, yyyy') : '';
      dateRangeText = toDate ? `${fromDate} to ${toDate}` : `Starting on ${fromDate}`;
    }
    
    const prompt = `Create a detailed proposal for this project:
Project Type: ${projectType}
Hourly Rate: $${hourlyRate}
Freelancer Rate: $${freelancerRate || 'Not specified'}
Project Budget: ${projectBudget ? '$' + projectBudget : 'Not specified'}
Timeline: ${dateRangeText || 'Not specified'}
Project Description: ${projectDescription}`;

    // If we have a stream handler, use the streaming endpoint
    if (onStreamUpdate) {
      const response = await supabase.functions.invoke('generate-proposal', {
        body: {
          prompt,
          hourlyRate,
          projectBudget,
          freelancerRate
        },
        responseType: 'stream'  // Use streaming response
      });

      if (response.error) {
        console.error('Error generating proposal:', response.error);
        throw new Error('Failed to generate proposal');
      }
      
      // Handle the streaming response
      return handleStreamingResponse(
        response.data,
        hourlyRate,
        projectBudget,
        onStreamUpdate
      );
    } 
    // Otherwise use the regular endpoint (fallback for compatibility)
    else {
      const response = await supabase.functions.invoke('generate-proposal', {
        body: {
          prompt,
          hourlyRate,
          projectBudget,
          freelancerRate
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

      let sections = data.sections;
      
      // Ensure all hours are whole numbers and prices correctly match hourly rate
      ensureWholeNumbersAndCorrectPrices(sections, hourlyRate);
      
      // If a project budget is specified, adjust all line items to match this budget
      if (projectBudget) {
        sections = adjustSectionsToMatchBudget(sections, projectBudget, hourlyRate, true);
      }

      return sections;
    }
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
}

// Handle streaming response from Supabase Edge Function
async function handleStreamingResponse(
  stream: ReadableStream,
  hourlyRate: number,
  projectBudget?: number,
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let finalSections: ProposalSection[] = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      
      // Process each line in the chunk
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data:')) continue;
        
        const dataContent = line.replace(/^data: /, '').trim();
        
        // Check if we're done
        if (dataContent === '[DONE]') break;
        
        try {
          const data = JSON.parse(dataContent);
          
          if (data.error) {
            console.error('Error from streaming API:', data.error);
            continue;
          }
          
          if (data.sections) {
            let sections = [...data.sections];
            
            // Process the streamed sections
            ensureWholeNumbersAndCorrectPrices(sections, hourlyRate);
            
            // Apply budget adjustment if needed
            if (projectBudget) {
              sections = adjustSectionsToMatchBudget(sections, projectBudget, hourlyRate, true);
            }
            
            // Update the state via callback
            if (onStreamUpdate) {
              onStreamUpdate(sections);
            }
            
            // Save for final return
            finalSections = sections;
          }
        } catch (e) {
          console.error('Error parsing streaming data:', e, dataContent);
        }
      }
    }
    
    return finalSections;
  } catch (error) {
    console.error('Error processing stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

// Helper function to ensure hours are whole numbers and prices match hourly rate
function ensureWholeNumbersAndCorrectPrices(sections: ProposalSection[], hourlyRate: number): void {
  sections.forEach(section => {
    section.items.forEach(item => {
      // Convert hours to whole numbers
      const hours = parseInt(item.hours.toString(), 10);
      if (!isNaN(hours)) {
        item.hours = hours.toString();
        const price = hours * hourlyRate;
        item.price = `$${price}`;
      }
    });
    
    // Recalculate subtotals based on updated prices
    recalculateSubtotals([section]);
  });
}
