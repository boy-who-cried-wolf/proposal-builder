
import { ProposalInput, ProposalSection } from '@/types/proposal';

// Fallback function that simulates streaming for development/testing
export const fallbackGenerateProposal = async (
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
