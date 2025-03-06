
import React from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { ProposalSection } from "@/types/proposal";
import { DateRange } from "react-day-picker";
import { ProposalContent } from "@/components/proposal/ProposalContent";
import { ProposalHeader } from "@/components/proposal/ProposalHeader";
import { ProposalFooter } from "@/components/proposal/ProposalFooter";

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
  generatedProposalSections = [],
  projectDescription,
  projectType,
  hourlyRate,
  freelancerRate,
  projectBudget,
  dateRange,
  proposalHistory = [],
  onRevertProposal,
  // We don't need to destructure the other props here since we're just passing children
  // But we need to include them in the interface to avoid TypeScript errors
}) => {
  const location = useLocation();
  
  // Check if the current route is account settings related to apply reduced padding
  const isAccountSettings = location.pathname.includes('account-settings');
  
  // Check if we're on the homepage (root path) and if we have any proposal sections to display
  const isHomePage = location.pathname === '/';
  const hasProposal = generatedProposalSections.length > 0;

  // Display the proposal content if we're on the home page and have proposal data
  const renderProposalContent = () => {
    if (isHomePage && hasProposal) {
      return (
        <div className="flex flex-col h-full">
          <ProposalHeader 
            projectType={projectType}
            projectDescription={projectDescription}
            hourlyRate={hourlyRate}
            freelancerRate={freelancerRate}
            projectBudget={projectBudget}
            dateRange={dateRange}
            // Add other required props with default values
            activeHeaderTab={null}
            handleHeaderTabChange={() => {}}
            handleSaveProposal={() => {}}
            handleCopyToFigma={() => {}}
            isSaving={false}
            isCopying={false}
          />
          
          <div className="flex-1 overflow-auto p-4">
            <ProposalContent 
              sections={generatedProposalSections}
              onEditItem={(sectionIndex, itemIndex) => {
                console.log('Edit item:', sectionIndex, itemIndex);
              }}
              onOpenSectionSettings={(sectionIndex) => {
                console.log('Open section settings:', sectionIndex);
              }}
              onAddItem={(sectionIndex) => {
                console.log('Add item to section:', sectionIndex);
              }}
              onReorderSections={(startIndex, endIndex) => {
                console.log('Reorder sections:', startIndex, endIndex);
              }}
              onReorderItems={(sectionIndex, startIndex, endIndex) => {
                console.log('Reorder items:', sectionIndex, startIndex, endIndex);
              }}
            />
          </div>
          
          <ProposalFooter 
            sections={generatedProposalSections}
            dateRange={dateRange}
            hourlyRate={hourlyRate}
            freelancerRate={freelancerRate}
            proposalHistory={proposalHistory}
            onRevertProposal={onRevertProposal}
          />
        </div>
      );
    }
    
    return children;
  };
  
  return (
    <main
      className={cn(
        "flex-1 overflow-auto",
        isAccountSettings ? "pl-0" : "pl-0", // Removed padding completely for all pages
        className
      )}
    >
      {renderProposalContent()}
    </main>
  );
};
