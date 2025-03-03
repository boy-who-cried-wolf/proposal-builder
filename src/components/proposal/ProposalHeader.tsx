
import React from "react";
import { ProposalHeaderTabs } from "@/components/proposal/ProposalHeaderTabs";
import { ProposalSection } from "@/types/proposal";

interface ProposalHeaderProps {
  activeHeaderTab: number;
  handleHeaderTabChange: (index: number) => void;
  handleSaveProposal: () => void;
  handleCopyToFigma: () => void;
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  isSaving: boolean;
  isCopying: boolean;
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  activeHeaderTab,
  handleHeaderTabChange,
  handleSaveProposal,
  handleCopyToFigma,
  proposalHistory,
  onRevertProposal,
  isSaving,
  isCopying
}) => {
  return (
    <header className="h-[69px] flex justify-between items-center px-[23px] py-[15px] border-b-black border-b border-solid">
      <h1 className="text-black text-[26px] font-bold max-sm:text-xl">
        proposal 1.0
      </h1>

      <div className="flex items-center">
        <ProposalHeaderTabs
          activeHeaderTab={activeHeaderTab}
          handleHeaderTabChange={handleHeaderTabChange}
          handleSaveProposal={handleSaveProposal}
          handleCopyToFigma={handleCopyToFigma}
          proposalHistory={proposalHistory}
          onRevertProposal={onRevertProposal}
          isSaving={isSaving}
          isCopying={isCopying}
        />
      </div>
    </header>
  );
};
