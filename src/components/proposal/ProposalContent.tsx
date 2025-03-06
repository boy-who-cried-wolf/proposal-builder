
import React from "react";
import { ProposalSection } from "@/types/proposal";
import { ProposalTable } from "@/components/proposal/ProposalTable";

interface ProposalContentProps {
  sections: ProposalSection[];
  onEditItem: (sectionIndex: number, itemIndex: number) => void;
  onOpenSectionSettings: (sectionIndex: number) => void;
  onAddItem?: (sectionIndex: number) => void;
  onReorderSections?: (startIndex: number, endIndex: number) => void;
  onReorderItems?: (sectionIndex: number, startIndex: number, endIndex: number) => void;
}

export const ProposalContent: React.FC<ProposalContentProps> = ({
  sections,
  onEditItem,
  onOpenSectionSettings,
  onAddItem,
  onReorderSections,
  onReorderItems
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
      onAddItem={onAddItem}
      onReorderSections={onReorderSections}
      onReorderItems={onReorderItems}
    />
  );
};
