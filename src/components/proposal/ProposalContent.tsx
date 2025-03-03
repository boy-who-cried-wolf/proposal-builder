
import React from "react";
import { ProposalSection } from "@/utils/openaiProposal";
import { ProposalTable } from "@/components/proposal/ProposalTable";

interface ProposalContentProps {
  sections: ProposalSection[];
  onEditItem: (sectionIndex: number, itemIndex: number) => void;
  onOpenSectionSettings: (sectionIndex: number) => void;
}

export const ProposalContent: React.FC<ProposalContentProps> = ({
  sections,
  onEditItem,
  onOpenSectionSettings
}) => {
  if (sections.length === 0) {
    return (
      <div className="p-6 bg-[#F7F6F2] rounded-md text-center">
        <p className="text-gray-600">No proposal generated yet. Use the Project Settings tab to generate a proposal.</p>
      </div>
    );
  }

  return (
    <ProposalTable 
      sections={sections} 
      onEditItem={onEditItem} 
      onOpenSectionSettings={onOpenSectionSettings}
    />
  );
};
