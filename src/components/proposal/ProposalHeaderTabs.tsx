
import React from "react";
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import { DiamondPlus, Timer, Eye, Send, Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalHeaderTabsProps {
  activeHeaderTab: number | null;
  handleHeaderTabChange: (index: number | null) => void;
  handleSaveProposal: () => void;
  handleCopyToFigma: () => void;
  isSaving: boolean;
  isCopying: boolean;
}

export const ProposalHeaderTabs: React.FC<ProposalHeaderTabsProps> = ({
  activeHeaderTab,
  handleHeaderTabChange,
  handleSaveProposal,
  handleCopyToFigma,
  isSaving,
  isCopying,
}) => {
  const tabs: Tab[] = [
    { 
      title: "Add Premium", 
      icon: DiamondPlus,
      content: <div className="p-4">Add premium features here</div> 
    },
    { 
      title: "Time Tracking", 
      icon: Timer,
      content: <div className="p-4">Enable time tracking</div> 
    },
    { 
      title: "Preview", 
      icon: Eye,
      content: <div className="p-4">Preview the proposal</div> 
    },
    { 
      title: "Send", 
      icon: Send,
      content: <div className="p-4">Send proposal to client</div> 
    },
    { 
      title: "Copy", 
      icon: Copy,
      content: (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Copy Proposal to Figma</h2>
          <p className="mb-4">Copy your proposal in a format optimized for pasting into Figma.</p>
          <Button 
            onClick={handleCopyToFigma} 
            disabled={isCopying}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isCopying ? 'Copying...' : 'Copy to Figma'} <Copy size={16} />
          </Button>
        </div>
      )
    },
    { 
      title: "Save Proposal", 
      icon: Save,
      content: (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Save Proposal</h2>
          <p className="mb-4">Save your current proposal to your account.</p>
          <Button 
            onClick={handleSaveProposal} 
            disabled={isSaving}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Proposal'} <Save size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <ExpandableTabs
      tabs={tabs}
      activeTab={activeHeaderTab}
      onTabChange={handleHeaderTabChange}
      showTabContent={activeHeaderTab !== null}
    />
  );
};
