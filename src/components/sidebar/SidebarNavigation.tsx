
import React from "react";
import { SidebarNavItem } from "./SidebarNavItem";
import { 
  ArrowDownIcon, 
  DiamondIcon, 
  DocumentIcon, 
  ViewIcon
} from "@/components/icons";
import { MessageSquare, Settings, Users } from "lucide-react";

interface SidebarNavigationProps {
  activeNavItem: number | null;
  isExpanded: boolean;
  onNavItemClick: (index: number) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeNavItem,
  isExpanded,
  onNavItemClick,
}) => {
  const navItems = [
    {
      title: "Dashboard",
      icon: ArrowDownIcon,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Overview</li>
            <li className="cursor-pointer hover:text-primary">Analytics</li>
            <li className="cursor-pointer hover:text-primary">Reports</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Clients",
      icon: Users,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">All Clients</li>
            <li className="cursor-pointer hover:text-primary">Add Client</li>
            <li className="cursor-pointer hover:text-primary">Client Groups</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Assistant",
      icon: MessageSquare,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Chat</li>
            <li className="cursor-pointer hover:text-primary">Templates</li>
            <li className="cursor-pointer hover:text-primary">History</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Settings",
      icon: Settings,
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">Account</li>
            <li className="cursor-pointer hover:text-primary">Preferences</li>
            <li className="cursor-pointer hover:text-primary">Team</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <nav className="grow flex flex-col gap-3 p-[11px] overflow-hidden">
      {navItems.map((item, index) => (
        <SidebarNavItem
          key={index}
          title={item.title}
          icon={item.icon}
          content={item.content}
          isActive={activeNavItem === index}
          isExpanded={isExpanded}
          onItemClick={() => onNavItemClick(index)}
        />
      ))}
    </nav>
  );
};
