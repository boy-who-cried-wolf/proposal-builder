
import React from "react";
import { ProposalHeaderTabs } from "@/components/proposal/ProposalHeaderTabs";
import { ProposalSection } from "@/types/proposal";

interface ProposalHeaderProps {
  activeHeaderTab: number | null;
  handleHeaderTabChange: (index: number | null) => void;
  handleSaveProposal: () => void;
  handleCopyToFigma: () => void;
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  isSaving: boolean;
  isCopying: boolean;
  onAddSection?: () => void;
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
  onAddSection
}) => {
  return (
    <div className="px-[23px] py-[20px] border-b border-solid border-b-black">
      <ProposalHeaderTabs
        activeHeaderTab={activeHeaderTab}
        handleHeaderTabChange={handleHeaderTabChange}
        handleSaveProposal={handleSaveProposal}
        handleCopyToFigma={handleCopyToFigma}
        proposalHistory={proposalHistory}
        onRevertProposal={onRevertProposal}
        isSaving={isSaving}
        isCopying={isCopying}
        onAddSection={onAddSection}
      />
    </div>
  );
};
