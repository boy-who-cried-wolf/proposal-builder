
export interface ProposalSection {
  title: string;
  items: ProposalItem[];
  subtotal: string;
}

export interface ProposalItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

export interface ProposalInput {
  projectDescription: string;
  hourlyRate: number;
  projectType: string;
  projectBudget?: number;
  dateRange?: {
    from: Date;
    to?: Date;
  };
}

export interface SaveProposalInput {
  title: string;
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
  sections: ProposalSection[];
}

export interface SectionTemplate {
  id: string;
  title: string;
  description: string;
  items: ProposalItem[];
  user_id: string;
  created_at: string;
}
