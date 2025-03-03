
import { ProposalSection } from "@/utils/openaiProposal";
import { DateRange } from "react-day-picker";

export interface MainContentProps {
  generatedProposalSections: ProposalSection[];
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
  freelancerRate?: number;
  projectBudget?: number;
  dateRange?: DateRange;
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
