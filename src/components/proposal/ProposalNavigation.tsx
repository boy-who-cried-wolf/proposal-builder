
import React from "react";
import { NavTab } from "@/components/ui/NavItem";

interface ProposalNavigationProps {
  activeTab: number;
  handleTabClick: (index: number) => void;
}

export const ProposalNavigation: React.FC<ProposalNavigationProps> = ({
  activeTab,
  handleTabClick,
}) => {
  return (
    <nav className="flex gap-[34px] px-[23px] py-[15px]">
      <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
        Proposal
      </NavTab>

      <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
        Revisions
      </NavTab>

      <NavTab active={activeTab === 2} onClick={() => handleTabClick(2)}>
        Metrics
      </NavTab>
    </nav>
  );
};
