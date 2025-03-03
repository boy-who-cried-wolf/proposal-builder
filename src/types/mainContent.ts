
import { ProposalSection } from "@/utils/openaiProposal";

export interface TaskItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

export interface MainContentProps {
  generatedProposalSections: ProposalSection[];
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
}

export interface EditingItem {
  sectionIndex: number;
  itemIndex: number;
  item: TaskItem;
}
