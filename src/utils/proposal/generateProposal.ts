
import { supabase } from '@/integrations/supabase/client';
import { ProposalSection, ProposalInput } from '@/types/proposal';
import { toast } from 'sonner';

// Function to parse streaming response data
const parseStreamData = (data: string): ProposalSection[] => {
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

export const generateProposal = async (
  input: ProposalInput,
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> => {
  try {
    // Start with empty sections array
    let sections: ProposalSection[] = [];
    
    // Make the API call to our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-proposal', {
      body: { input },
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
    
  } catch (error: any) {
    console.error('Error in generateProposal:', error);
    
    // For demo/testing when the edge function isn't working,
    // let's fall back to local generation
    console.log('Falling back to local generation...');
    return fallbackGenerateProposal(input, onStreamUpdate);
  }
};

// Fallback function that simulates streaming for development/testing
const fallbackGenerateProposal = async (
  input: ProposalInput,
  onStreamUpdate?: (sections: ProposalSection[]) => void
): Promise<ProposalSection[]> => {
  const sections: ProposalSection[] = [];
  
  // Simulate adding sections with delays to mimic streaming
  const addSection = (section: ProposalSection, delay: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        sections.push(section);
        if (onStreamUpdate) {
          onStreamUpdate([...sections]);
        }
        resolve();
      }, delay);
    });
  };

  // Introduction section
  await addSection({
    id: '1',
    title: 'Introduction',
    content: `Thank you for considering our services for your ${input.projectType} project. This proposal outlines our approach to deliver a high-quality solution that meets your requirements.`,
    editableTitle: true,
    editableContent: true,
  }, 500);

  // Project Overview
  await addSection({
    id: '2',
    title: 'Project Overview',
    content: input.projectDescription || 'This project aims to create a custom solution tailored to your specific needs and requirements.',
    editableTitle: true,
    editableContent: true,
  }, 1000);

  // Calculate appropriate hours based on budget
  const totalHours = Math.floor(input.projectBudget / input.hourlyRate);
  const distributableHours = totalHours - Math.floor(totalHours * 0.2); // Reserve 20% for management
  
  // Scope of Work with tasks
  const scopeSection: ProposalSection = {
    id: '3',
    title: 'Scope of Work',
    content: 'The following tasks outline the scope of work for this project:',
    editableTitle: true,
    editableContent: true,
    tasks: [],
  };
  
  // Add generic tasks based on project type
  if (input.projectType === 'Website') {
    // Distribute hours among tasks
    const designHours = Math.floor(distributableHours * 0.3);
    const developmentHours = Math.floor(distributableHours * 0.5);
    const testingHours = distributableHours - designHours - developmentHours;
    
    scopeSection.tasks = [
      {
        id: '3-1',
        description: 'Design and wireframing',
        hours: designHours,
        rate: input.hourlyRate,
      },
      {
        id: '3-2',
        description: 'Frontend and backend development',
        hours: developmentHours,
        rate: input.hourlyRate,
      },
      {
        id: '3-3',
        description: 'Testing and quality assurance',
        hours: testingHours,
        rate: input.hourlyRate,
      },
      {
        id: '3-4',
        description: 'Project management and coordination',
        hours: Math.floor(totalHours * 0.2),
        rate: input.hourlyRate,
      },
    ];
  } else {
    // Generic tasks for other project types
    scopeSection.tasks = [
      {
        id: '3-1',
        description: 'Planning and requirements gathering',
        hours: Math.floor(distributableHours * 0.2),
        rate: input.hourlyRate,
      },
      {
        id: '3-2',
        description: 'Implementation and development',
        hours: Math.floor(distributableHours * 0.6),
        rate: input.hourlyRate,
      },
      {
        id: '3-3',
        description: 'Testing and quality assurance',
        hours: distributableHours - Math.floor(distributableHours * 0.2) - Math.floor(distributableHours * 0.6),
        rate: input.hourlyRate,
      },
      {
        id: '3-4',
        description: 'Project management and coordination',
        hours: Math.floor(totalHours * 0.2),
        rate: input.hourlyRate,
      },
    ];
  }
  
  await addSection(scopeSection, 1500);

  // Timeline section
  await addSection({
    id: '4',
    title: 'Timeline',
    content: `This project is estimated to be completed within ${Math.ceil(totalHours / 40)} weeks from the start date. We will begin work immediately upon approval of this proposal.`,
    editableTitle: true,
    editableContent: true,
  }, 800);

  // Budget section
  await addSection({
    id: '5',
    title: 'Budget',
    content: `The total budget for this project is $${input.projectBudget.toLocaleString()}, based on our hourly rate of $${input.hourlyRate}/hour. This includes all tasks outlined in the Scope of Work.`,
    editableTitle: true,
    editableContent: true,
  }, 700);

  // Terms section
  await addSection({
    id: '6',
    title: 'Terms and Conditions',
    content: 'Payment terms: 50% deposit upon signing, with the remaining 50% due upon project completion. The project includes two rounds of revisions. Additional revisions will be billed at our standard hourly rate.',
    editableTitle: true,
    editableContent: true,
  }, 600);
  
  return sections;
};
