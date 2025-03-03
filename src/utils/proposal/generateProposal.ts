
import { supabase } from '@/integrations/supabase/client';
import { ProposalSection, ProposalInput, ProposalItem } from '@/types/proposal';
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
    // Get the current user's knowledge base if they're logged in
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
    
    // Add the knowledge base to the input
    const enrichedInput = {
      ...input,
      knowledgeBase,
      userServices
    };
    
    // Start with empty sections array
    let sections: ProposalSection[] = [];
    
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
    title: 'Introduction',
    items: [{
      item: 'Introduction',
      description: `Thank you for considering our services for your ${input.projectType} project. This proposal outlines our approach to deliver a high-quality solution that meets your requirements.`,
      hours: '0',
      price: '$0'
    }],
    subtotal: '$0',
  }, 500);

  // Project Overview
  await addSection({
    title: 'Project Overview',
    items: [{
      item: 'Project Description',
      description: input.projectDescription || 'This project aims to create a custom solution tailored to your specific needs and requirements.',
      hours: '0',
      price: '$0'
    }],
    subtotal: '$0',
  }, 1000);

  // Calculate appropriate hours based on budget
  const totalHours = Math.floor(input.projectBudget / input.hourlyRate);
  const distributableHours = totalHours - Math.floor(totalHours * 0.2); // Reserve 20% for management
  
  // Scope of Work with tasks
  const scopeSection: ProposalSection = {
    title: 'Scope of Work',
    items: [],
    subtotal: '$0',
  };
  
  // Add generic tasks based on project type
  if (input.projectType === 'Website') {
    // Distribute hours among tasks
    const designHours = Math.floor(distributableHours * 0.3);
    const developmentHours = Math.floor(distributableHours * 0.5);
    const testingHours = distributableHours - designHours - developmentHours;
    
    scopeSection.items = [
      {
        item: 'Design and wireframing',
        description: 'Creating mockups and design concepts for the website',
        hours: designHours.toString(),
        price: `$${designHours * input.hourlyRate}`
      },
      {
        item: 'Frontend and backend development',
        description: 'Building the website functionality and user interface',
        hours: developmentHours.toString(),
        price: `$${developmentHours * input.hourlyRate}`
      },
      {
        item: 'Testing and quality assurance',
        description: 'Ensuring the website works correctly across devices',
        hours: testingHours.toString(),
        price: `$${testingHours * input.hourlyRate}`
      },
      {
        item: 'Project management and coordination',
        description: 'Overseeing project progress and communication',
        hours: Math.floor(totalHours * 0.2).toString(),
        price: `$${Math.floor(totalHours * 0.2) * input.hourlyRate}`
      },
    ];
  } else {
    // Generic tasks for other project types
    scopeSection.items = [
      {
        item: 'Planning and requirements gathering',
        description: 'Defining project scope and requirements',
        hours: Math.floor(distributableHours * 0.2).toString(),
        price: `$${Math.floor(distributableHours * 0.2) * input.hourlyRate}`
      },
      {
        item: 'Implementation and development',
        description: 'Building the core functionality of the project',
        hours: Math.floor(distributableHours * 0.6).toString(),
        price: `$${Math.floor(distributableHours * 0.6) * input.hourlyRate}`
      },
      {
        item: 'Testing and quality assurance',
        description: 'Ensuring all components work correctly',
        hours: (distributableHours - Math.floor(distributableHours * 0.2) - Math.floor(distributableHours * 0.6)).toString(),
        price: `$${(distributableHours - Math.floor(distributableHours * 0.2) - Math.floor(distributableHours * 0.6)) * input.hourlyRate}`
      },
      {
        item: 'Project management and coordination',
        description: 'Overseeing project progress and communication',
        hours: Math.floor(totalHours * 0.2).toString(),
        price: `$${Math.floor(totalHours * 0.2) * input.hourlyRate}`
      },
    ];
  }
  
  // Calculate subtotal for the scope section
  let scopeSubtotal = 0;
  scopeSection.items.forEach(item => {
    const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(price)) {
      scopeSubtotal += price;
    }
  });
  scopeSection.subtotal = `$${scopeSubtotal}`;
  
  await addSection(scopeSection, 1500);

  // Timeline section
  await addSection({
    title: 'Timeline',
    items: [{
      item: 'Project Timeline',
      description: `This project is estimated to be completed within ${Math.ceil(totalHours / 40)} weeks from the start date. We will begin work immediately upon approval of this proposal.`,
      hours: '0',
      price: '$0'
    }],
    subtotal: '$0',
  }, 800);

  // Budget section
  await addSection({
    title: 'Budget',
    items: [{
      item: 'Total Budget',
      description: `The total budget for this project is $${input.projectBudget.toLocaleString()}, based on our hourly rate of $${input.hourlyRate}/hour. This includes all tasks outlined in the Scope of Work.`,
      hours: totalHours.toString(),
      price: `$${input.projectBudget}`
    }],
    subtotal: `$${input.projectBudget}`,
  }, 700);

  // Terms section
  await addSection({
    title: 'Terms and Conditions',
    items: [{
      item: 'Payment Terms',
      description: 'Payment terms: 50% deposit upon signing, with the remaining 50% due upon project completion. The project includes two rounds of revisions. Additional revisions will be billed at our standard hourly rate.',
      hours: '0',
      price: '$0'
    }],
    subtotal: '$0',
  }, 600);
  
  return sections;
};
