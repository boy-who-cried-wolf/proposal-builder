
import { generateProposal } from './generateProposal';
import { saveProposal } from './saveProposal';
import { getSectionTemplates } from './sectionTemplates';
import type { 
  ProposalSection, 
  ProposalItem, 
  ProposalInput, 
  SaveProposalInput, 
  SectionTemplate 
} from '@/types/proposal';

// Re-export everything to maintain the current API
export { 
  generateProposal,
  saveProposal,
  getSectionTemplates
};

// Re-export types
export type {
  ProposalSection,
  ProposalItem,
  ProposalInput,
  SaveProposalInput,
  SectionTemplate
};
