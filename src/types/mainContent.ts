
import { ProposalSection } from "@/types/proposal";

export interface MainContentProps {
  generatedProposalSections: ProposalSection[];
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
  freelancerRate?: number;
  projectBudget?: number;
  dateRange?: { from: Date; to?: Date };
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
}

export interface EditingItem {
  sectionIndex: number;
  itemIndex: number;
  item: {
    item: string;
    description: string;
    hours: string;
    price: string;
  };
}
