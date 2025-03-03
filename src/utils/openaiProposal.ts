
import { generateProposal } from './proposal/generateProposal';
import { saveProposal } from './proposal/saveProposal';
import { getSectionTemplates } from './proposal/sectionTemplates';
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
