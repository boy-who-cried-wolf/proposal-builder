import React from "react";
import { NavItem } from "@/components/ui/NavItem";
import {
  ArrowDownIcon,
  ViewIcon,
  DiamondIcon,
  DocumentIcon,
  LogoutIcon,
} from "@/components/icons";

export const Sidebar: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = React.useState(0);

  const handleNavItemClick = (index: number) => {
    setActiveNavItem(index);
  };

  return (
    <aside className="w-[254px] flex flex-col bg-white border-r-black border-r border-solid max-md:w-full max-md:h-auto">
      <div className="text-black text-[19px] font-bold h-[69px] px-[27px] py-[17px] border-b-black border-b border-solid">
        proposal builder
      </div>

      <nav className="grow flex flex-col gap-3 p-[11px]">
        <NavItem
          active={activeNavItem === 0}
          icon={<ArrowDownIcon />}
          onClick={() => handleNavItemClick(0)}
        >
          Dashboard
        </NavItem>

        <NavItem
          active={activeNavItem === 1}
          icon={<ViewIcon />}
          onClick={() => handleNavItemClick(1)}
        >
          Dashboard
        </NavItem>

        <NavItem
          active={activeNavItem === 2}
          icon={<DiamondIcon />}
          onClick={() => handleNavItemClick(2)}
        >
          Dashboard
        </NavItem>

        <NavItem
          active={activeNavItem === 3}
          icon={<DocumentIcon />}
          onClick={() => handleNavItemClick(3)}
        >
          Dashboard
        </NavItem>
      </nav>

      <div className="h-[69px] p-[17px] border-t-black border-t border-solid">
        <div className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase mb-3">
          Josh@movercreative.com
        </div>
        <div className="flex items-center justify-between">
          <div className="text-black text-[10px] font-semibold tracking-[1.544px] uppercase">
            Logout
          </div>
          <div className="text-black">
            <LogoutIcon />
          </div>
        </div>
      </div>
    </aside>
  );
};
