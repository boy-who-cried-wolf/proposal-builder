
import React from "react";
import { NavTab } from "@/components/ui/NavItem";

interface MiddleSectionTabsProps {
  activeTab: number;
  onTabClick: (index: number) => void;
}

export const MiddleSectionTabs: React.FC<MiddleSectionTabsProps> = ({
  activeTab,
  onTabClick
}) => {
  return (
    <div className="flex gap-[34px] px-[23px] py-[15px]">
      <NavTab active={activeTab === 0} onClick={() => onTabClick(0)}>
        Setup
      </NavTab>

      <NavTab active={activeTab === 1} onClick={() => onTabClick(1)}>
        Assistant
      </NavTab>
    </div>
  );
};
