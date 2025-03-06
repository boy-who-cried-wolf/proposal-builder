
import { ProposalSection } from "@/types/proposal";
import { DateRange } from "react-day-picker";

export interface MainContentProps {
  generatedProposalSections?: ProposalSection[];
  projectDescription?: string;
  projectType?: string;
  hourlyRate?: number;
  freelancerRate?: number;
  projectBudget?: number;
  dateRange?: DateRange;
  services?: Array<string>;
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  children?: React.ReactNode;
  className?: string;
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
