
import React from "react";
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import { DiamondPlus, Timer, Eye, Send, Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalHeaderTabsProps {
  activeHeaderTab: number | null;
  handleHeaderTabChange: (index: number | null) => void;
  handleSaveProposal: () => void;
  isSaving: boolean;
}

export const ProposalHeaderTabs: React.FC<ProposalHeaderTabsProps> = ({
  activeHeaderTab,
  handleHeaderTabChange,
  handleSaveProposal,
  isSaving,
}) => {
  const headerTabs: Tab[] = [
    { 
      title: "Add Section", 
      icon: DiamondPlus,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Add New Section</h2>
          <p>Here you can add a new section to your proposal.</p>
        </div>
      )
    },
    { 
      title: "Toggle Hours", 
      icon: Timer,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Hours Display Settings</h2>
          <p>Configure how hours are displayed in your proposal.</p>
        </div>
      )
    },
    { 
      title: "Preview", 
      icon: Eye,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Proposal Preview</h2>
          <p>Preview how your proposal will appear to clients.</p>
        </div>
      )
    },
    { 
      title: "Send", 
      icon: Send,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Send Proposal</h2>
          <p>Send this proposal to your client via email or generate a shareable link.</p>
        </div>
      )
    },
    { 
      title: "Copy", 
      icon: Copy,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Copy Proposal</h2>
          <p>Create a duplicate of this proposal as a starting point for a new one.</p>
        </div>
      )
    },
    { 
      title: "Save Proposal", 
      icon: Save,
      onClick: handleSaveProposal,
      content: null
    },
  ];

  return (
    <ExpandableTabs 
      tabs={headerTabs}
      className="border-gray-200"
      onChange={handleHeaderTabChange}
      showTabContent={activeHeaderTab !== null}
    />
  );
};
