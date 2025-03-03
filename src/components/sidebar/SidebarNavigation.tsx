
import React from "react";
import { SidebarNavItem } from "./SidebarNavItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanSubscription } from "@/hooks/usePlanSubscription";
import { 
  ArrowDownIcon, 
  DiamondIcon, 
  DocumentIcon, 
  ViewIcon
} from "@/components/icons";
import { MessageSquare, Settings, Users, LayoutDashboard, Lock } from "lucide-react";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = usePlanSubscription(user?.id);

  const handleItemClick = (path: string, index: number, requiredPlans: string[] = []) => {
    // Check if user has access to this feature based on their plan
    if (requiredPlans.length > 0 && !requiredPlans.includes(currentPlan)) {
      // Redirect to plan page instead
      navigate('/account-settings/plan');
      return;
    }
    
    onNavItemClick(index);
    if (path) {
      navigate(path);
    }
  };
  
  // Helper to determine if an item should be locked
  const isLocked = (requiredPlans: string[]) => {
    return requiredPlans.length > 0 && !requiredPlans.includes(currentPlan);
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      requiredPlans: ['freelancer', 'pro'],
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">
              <a href="/dashboard">Overview</a>
            </li>
            <li className="cursor-pointer hover:text-primary">Analytics</li>
            <li className="cursor-pointer hover:text-primary">Reports</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Clients",
      icon: Users,
      path: "",
      requiredPlans: ['freelancer', 'pro'],
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
      path: "",
      requiredPlans: ['pro'],
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
      path: "/account-settings",
      requiredPlans: [],
      content: (
        <div className="p-3 bg-muted/20 rounded-sm mt-1">
          <ul className="space-y-2 text-xs">
            <li className="cursor-pointer hover:text-primary">
              <a href="/account-settings">Account</a>
            </li>
            <li className="cursor-pointer hover:text-primary">
              <a href="/account-settings/organization">Organization</a>
            </li>
            <li className="cursor-pointer hover:text-primary">
              <a href="/account-settings/plan">Plan</a>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <nav className="grow flex flex-col gap-3 p-[11px] overflow-hidden">
      {navItems.map((item, index) => (
        <div key={index} className="relative">
          <SidebarNavItem
            title={item.title}
            icon={item.icon}
            content={item.content}
            isActive={activeNavItem === index}
            isExpanded={isExpanded}
            onItemClick={() => handleItemClick(item.path, index, item.requiredPlans)}
          />
          
          {isLocked(item.requiredPlans) && isExpanded && (
            <div className="absolute top-2 right-2 text-amber-500" title={`Requires ${item.requiredPlans.join(' or ')} plan`}>
              <Lock size={16} />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};
