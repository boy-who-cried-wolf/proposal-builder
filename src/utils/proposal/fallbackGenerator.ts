
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

  // Calculate appropriate hours based on budget
  const totalHours = Math.floor((input.projectBudget || 5000) / input.hourlyRate);
  const distributableHours = Math.max(totalHours - Math.floor(totalHours * 0.1), 1); // Reserve 10% for management
  
  // Scope of Work with billable tasks only
  const scopeSection: ProposalSection = {
    title: 'Project Scope',
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
        item: 'Project management',
        description: 'Overseeing project progress and communication',
        hours: Math.floor(totalHours * 0.1).toString(),
        price: `$${Math.floor(totalHours * 0.1) * input.hourlyRate}`
      },
    ];
  } else if (input.projectType === 'Mobile App') {
    const designHours = Math.floor(distributableHours * 0.25);
    const developmentHours = Math.floor(distributableHours * 0.6);
    const testingHours = distributableHours - designHours - developmentHours;
    
    scopeSection.items = [
      {
        item: 'UI/UX Design',
        description: 'Creating app wireframes and UI components',
        hours: designHours.toString(),
        price: `$${designHours * input.hourlyRate}`
      },
      {
        item: 'App Development',
        description: 'Building the mobile application functionality',
        hours: developmentHours.toString(),
        price: `$${developmentHours * input.hourlyRate}`
      },
      {
        item: 'Testing & App Store Submission',
        description: 'QA testing and preparing for app stores',
        hours: testingHours.toString(),
        price: `$${testingHours * input.hourlyRate}`
      },
      {
        item: 'Project management',
        description: 'Coordination and client communication',
        hours: Math.floor(totalHours * 0.1).toString(),
        price: `$${Math.floor(totalHours * 0.1) * input.hourlyRate}`
      },
    ];
  } else {
    // Generic tasks for other project types
    scopeSection.items = [
      {
        item: 'Discovery & Planning',
        description: 'Defining project scope and requirements',
        hours: Math.floor(distributableHours * 0.2).toString(),
        price: `$${Math.floor(distributableHours * 0.2) * input.hourlyRate}`
      },
      {
        item: 'Implementation',
        description: 'Building the core functionality of the project',
        hours: Math.floor(distributableHours * 0.6).toString(),
        price: `$${Math.floor(distributableHours * 0.6) * input.hourlyRate}`
      },
      {
        item: 'Testing & Quality Assurance',
        description: 'Ensuring all components work correctly',
        hours: (distributableHours - Math.floor(distributableHours * 0.2) - Math.floor(distributableHours * 0.6)).toString(),
        price: `$${(distributableHours - Math.floor(distributableHours * 0.2) - Math.floor(distributableHours * 0.6)) * input.hourlyRate}`
      },
      {
        item: 'Project Management',
        description: 'Coordination and client communication',
        hours: Math.floor(totalHours * 0.1).toString(),
        price: `$${Math.floor(totalHours * 0.1) * input.hourlyRate}`
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
  
  // Start with just the primary billable sections
  await addSection(scopeSection, 1000);
  
  // For larger projects, add more sections
  if (input.projectType === 'Website' || input.projectType === 'Mobile App') {
    const additionalSection: ProposalSection = {
      title: input.projectType === 'Website' ? 'Content & SEO' : 'Marketing & Launch',
      items: [
        {
          item: input.projectType === 'Website' ? 'Content Creation' : 'Launch Strategy',
          description: input.projectType === 'Website' ? 'Creating website content' : 'Planning app launch and marketing',
          hours: Math.floor(totalHours * 0.1).toString(),
          price: `$${Math.floor(totalHours * 0.1) * input.hourlyRate}`
        },
        {
          item: input.projectType === 'Website' ? 'SEO Optimization' : 'App Store Optimization',
          description: input.projectType === 'Website' ? 'Search engine optimization' : 'Optimizing app store listing',
          hours: Math.floor(totalHours * 0.05).toString(), 
          price: `$${Math.floor(totalHours * 0.05) * input.hourlyRate}`
        }
      ],
      subtotal: `$${(Math.floor(totalHours * 0.1) + Math.floor(totalHours * 0.05)) * input.hourlyRate}`
    };
    
    await addSection(additionalSection, 800);
  }
  
  return sections;
};
