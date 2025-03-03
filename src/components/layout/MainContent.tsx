
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { TableSection } from "@/components/ui/TableSection";
import { MetricItem } from "@/components/ui/MetricItem";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import {
  Copy,
  Eye,
  Send,
  Timer,
  DiamondPlus,
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

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const headerTabs = [
    { title: "Add Section", icon: DiamondPlus },
    { title: "Toggle Hours", icon: Timer },
    { title: "Preview", icon: Eye },
    { title: "Send", icon: Send },
    { title: "Copy", icon: Copy },
  ];

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
        <TableSection title="design" items={designItems} subtotal="$25,000" />

        <TableSection
          title="development"
          items={developmentItems}
          subtotal="$25,000"
        />
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
