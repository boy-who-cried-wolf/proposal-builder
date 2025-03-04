
import { ProposalSection } from "@/types/proposal";

export interface MainContentProps {
  generatedProposalSections?: ProposalSection[];
  projectDescription?: string;
  projectType?: string;
  hourlyRate?: number;
  freelancerRate?: number;
  projectBudget?: number;
  dateRange?: { from: Date; to?: Date };
  services?: Array<string>;
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  children?: React.ReactNode;
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
