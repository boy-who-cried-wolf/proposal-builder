
import React from "react";
import { ProposalHeaderTabs } from "@/components/proposal/ProposalHeaderTabs";
import { ProposalSection } from "@/types/proposal";
import { DateRange } from "react-day-picker";

interface ProposalHeaderProps {
  activeHeaderTab?: number | null;
  handleHeaderTabChange?: (index: number | null) => void;
  handleSaveProposal?: () => void;
  handleCopyToFigma?: () => void;
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  isSaving?: boolean;
  isCopying?: boolean;
  onAddSection?: () => void;
  // Add the missing props
  projectType?: string;
  projectDescription?: string;
  hourlyRate?: number;
  freelancerRate?: number;
  projectBudget?: number;
  dateRange?: DateRange;
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  activeHeaderTab,
  handleHeaderTabChange,
  handleSaveProposal,
  handleCopyToFigma,
  proposalHistory,
  onRevertProposal,
  isSaving,
  isCopying,
  onAddSection,
  // Using the new props (but not doing anything with them yet)
  projectType,
  projectDescription,
  hourlyRate,
  freelancerRate,
  projectBudget,
  dateRange
}) => {
  return (
    <div className="px-[23px] py-[20px] border-b border-solid border-b-black">
      <ProposalHeaderTabs
        activeHeaderTab={activeHeaderTab || null}
        handleHeaderTabChange={handleHeaderTabChange || (() => {})}
        handleSaveProposal={handleSaveProposal || (() => {})}
        handleCopyToFigma={handleCopyToFigma || (() => {})}
        proposalHistory={proposalHistory}
        onRevertProposal={onRevertProposal}
        isSaving={isSaving || false}
        isCopying={isCopying || false}
        onAddSection={onAddSection}
      />
    </div>
  );
};
