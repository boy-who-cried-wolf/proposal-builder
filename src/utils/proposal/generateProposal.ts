
import { supabase } from '@/integrations/supabase/client';
import { ProposalInput, ProposalSection } from '@/types/proposal';
import { format } from 'date-fns';

export async function generateProposal(input: ProposalInput): Promise<ProposalSection[]> {
  try {
    const { projectDescription, hourlyRate, projectType, projectBudget, dateRange, freelancerRate } = input;
    
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
Freelancer Rate: $${freelancerRate || 'Not specified'}
Project Budget: ${projectBudget ? '$' + projectBudget : 'Not specified'}
Timeline: ${dateRangeText || 'Not specified'}
Project Description: ${projectDescription}`,
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

    // If a project budget is specified, adjust all line items to match this budget
    if (projectBudget) {
      sections = adjustSectionsToMatchBudget(sections, projectBudget);
    }

    return sections;
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
}

// Helper function to adjust section prices to match the budget
function adjustSectionsToMatchBudget(sections: ProposalSection[], budget: number): ProposalSection[] {
  // Calculate current total
  let currentTotal = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        currentTotal += price;
      }
    });
  });

  if (currentTotal === 0) return sections; // Avoid division by zero
  
  // Calculate the ratio to adjust all prices
  const ratio = budget / currentTotal;
  
  // Create a deep copy to avoid mutating the original
  const adjustedSections = JSON.parse(JSON.stringify(sections));
  
  // Adjust all prices and recalculate section totals
  adjustedSections.forEach((section: ProposalSection) => {
    let sectionTotal = 0;
    
    section.items.forEach((item: any) => {
      const originalPrice = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(originalPrice)) {
        const newPrice = Math.round(originalPrice * ratio);
        item.price = `$${newPrice}`;
        sectionTotal += newPrice;
      }
    });
    
    section.subtotal = `$${sectionTotal.toLocaleString()}`;
  });
  
  return adjustedSections;
}
