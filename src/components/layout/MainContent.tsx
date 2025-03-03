
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { TableSection } from "@/components/ui/TableSection";
import { MetricItem } from "@/components/ui/MetricItem";
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import { ProposalForm } from "@/components/ui/ProposalForm";
import {
  Copy,
  Eye,
  Send,
  Timer,
  DiamondPlus,
  Save,
  Settings,
  FileText,
  Clock,
  Users,
  PieChart,
  Mail,
} from "lucide-react";

// Sample data for tables
const designItems = Array(7).fill({
  item: "Item Name",
  description: "Here is a summary of this item",
  hours: "15",
  price: "$2500",
});

const developmentItems = Array(5).fill({
  item: "Item Name",
  description: "Here is a summary of this item",
  hours: "15",
  price: "$2500",
});

export const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeHeaderTab, setActiveHeaderTab] = useState<number | null>(null);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleHeaderTabChange = (index: number | null) => {
    setActiveHeaderTab(index);
  };

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
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Save Proposal</h2>
          <p>Your proposal has been saved successfully.</p>
        </div>
      )
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <ProposalForm />
            <TableSection title="design" items={designItems} subtotal="$25,000" />
            <TableSection title="development" items={developmentItems} subtotal="$25,000" />
          </>
        );
      case 1:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Revisions</h2>
            <p>Track and manage revisions to your proposal here.</p>
          </div>
        );
      case 2:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Metrics</h2>
            <p>View detailed metrics about your proposal performance.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="grow flex flex-col max-md:h-screen">
      <header className="h-[69px] flex justify-between items-center px-[23px] py-[15px] border-b-black border-b border-solid">
        <h1 className="text-black text-[26px] font-bold max-sm:text-xl">
          proposal 1.0
        </h1>

        <div className="flex items-center">
          <ExpandableTabs 
            tabs={headerTabs}
            className="border-gray-200"
            onChange={handleHeaderTabChange}
            showTabContent={activeHeaderTab !== null}
          />
        </div>
      </header>

      <nav className="flex gap-[34px] px-[23px] py-[15px]">
        <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
          download
        </NavTab>

        <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
          Revisions
        </NavTab>

        <NavTab active={activeTab === 2} onClick={() => handleTabClick(2)}>
          Metrics
        </NavTab>
      </nav>

      <div className="grow overflow-y-auto px-[23px] py-[15px]">
        {renderTabContent()}
      </div>

      <footer className="flex justify-between bg-[#F7F6F2] px-[17px] py-[15px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
        <MetricItem value="165" label="Total Hours" />
        <MetricItem value="2.6" label="Hours/Day" />
        <MetricItem value="$5,500" label="Monthly Revenue" />
        <MetricItem value="45%" label="Profit Margin" />
        <MetricItem value="$15,000" label="Total Value" />
      </footer>
    </main>
  );
};
