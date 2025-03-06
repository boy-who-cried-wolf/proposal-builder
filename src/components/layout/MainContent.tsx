
import React from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { ProposalSection } from "@/types/proposal";
import { DateRange } from "react-day-picker";

interface MainContentProps {
  children?: React.ReactNode;
  className?: string;
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
}

export const MainContent: React.FC<MainContentProps> = ({ 
  children, 
  className,
  // We don't need to destructure the other props here since we're just passing children
  // But we need to include them in the interface to avoid TypeScript errors
}) => {
  const location = useLocation();
  
  // Check if the current route is account settings related to apply reduced padding
  const isAccountSettings = location.pathname.includes('account-settings');
  
  return (
    <main
      className={cn(
        "flex-1 overflow-auto",
        isAccountSettings ? "pl-0" : "pl-1", // Reduced padding for all pages (pl-4 → pl-1)
        className
      )}
    >
      {children}
    </main>
  );
};
