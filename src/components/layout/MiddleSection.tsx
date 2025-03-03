
import React, { useState, useEffect } from "react";
import { ProposalForm } from "@/components/ui/ProposalForm";
import { ProposalSection } from "@/utils/openaiProposal";
import { MiddleSectionTabs } from "./MiddleSectionTabs";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { ResizablePanel } from "./ResizablePanel";

interface MiddleSectionProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
  proposalSections?: ProposalSection[];
  onUpdateProposal?: (sections: ProposalSection[]) => void;
}

export const MiddleSection: React.FC<MiddleSectionProps> = ({ 
  onProposalGenerated, 
  proposalSections = [],
  onUpdateProposal 
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleProposalGenerated = (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => {
    // Update the active tab to switch to Assistant view after generating a proposal
    setActiveTab(1);
    
    // Pass the generated proposal data to the parent component
    if (onProposalGenerated) {
      onProposalGenerated(sections, description, type, rate, freelancerRate);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="flex flex-col gap-3 overflow-y-auto max-h-full pb-4">
            <div className="mt-4">
              <ProposalForm onProposalGenerated={handleProposalGenerated} />
            </div>
          </div>
        );
      case 1:
        return (
          <AssistantChat 
            proposalSections={proposalSections} 
            onUpdateProposal={onUpdateProposal} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResizablePanel>
      <div className="text-[rgba(0,0,0,0.5)] text-[11px] font-semibold tracking-[1.715px] uppercase h-[69px] px-[19px] py-[25px] border-b-black border-b border-solid">
        Client Project Title &gt; Poposal...
      </div>

      <MiddleSectionTabs activeTab={activeTab} onTabClick={handleTabClick} />

      <div className="grow p-[11px] overflow-y-auto">
        {renderTabContent()}
      </div>
    </ResizablePanel>
  );
};
