
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import { ProposalSection } from "@/types/proposal";
import { Figma, History, Save, Send, Timer, Plus } from "lucide-react";
import React from "react";

interface ProposalHeaderTabsProps {
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

export const ProposalHeaderTabs: React.FC<ProposalHeaderTabsProps> = ({
  activeHeaderTab,
  handleHeaderTabChange,
  handleSaveProposal,
  handleCopyToFigma,
  proposalHistory = [],
  onRevertProposal,
  isSaving,
  isCopying,
  onAddSection,
}) => {
  const tabs: Tab[] = [
    {
      title: "Add Section",
      icon: Plus,
      onClick: () => onAddSection?.()
    },
    {
      title: "Toggle Hours",
      icon: Timer,
      // content: <div className="p-4">Toggle hours visibility</div>
    },
    {
      title: "Send",
      icon: Send,
      // content: <div className="p-4">Send proposal to client</div>
    },
    {
      title: "Copy to Figma",
      icon: Figma,
      onClick: () => handleCopyToFigma()
    },
    {
      title: "Save Proposal",
      icon: Save,
      onClick: () => handleSaveProposal()
    },
    {
      title: "Revert Changes",
      icon: History,
      // content: (
      //   <div className="p-4">
      //     <h2 className="text-xl font-bold mb-4">Revert to Previous Version</h2>
      //     {proposalHistory.length > 0 ? (
      //       <div className="space-y-4">
      //         <p className="mb-4">Select a previous version to revert to:</p>
      //         <div className="space-y-2">
      //           {proposalHistory.map((_, index) => (
      //             <Button
      //               key={index}
      //               onClick={() => onRevertProposal?.(index)}
      //               className="w-full bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded flex items-center justify-between"
      //             >
      //               <span>Version {index + 1}</span>
      //               <History size={16} />
      //             </Button>
      //           ))}
      //         </div>
      //       </div>
      //     ) : (
      //       <p className="text-gray-500">No previous versions available to revert to.</p>
      //     )}
      //   </div>
      // )
    },
  ];

  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-lg font-bold">Proposal</div>
      <ExpandableTabs
        tabs={tabs}
        activeTab={activeHeaderTab}
        onTabChange={handleHeaderTabChange}
        showTabContent={activeHeaderTab !== null}
      />
    </div>
  );
};
