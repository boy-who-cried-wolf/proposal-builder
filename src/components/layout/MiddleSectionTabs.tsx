
import React from "react";
import { NavTab } from "@/components/ui/NavItem";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanSubscription } from "@/hooks/usePlanSubscription";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface MiddleSectionTabsProps {
  activeTab: number;
  onTabClick: (index: number) => void;
}

export const MiddleSectionTabs: React.FC<MiddleSectionTabsProps> = ({
  activeTab,
  onTabClick
}) => {
  const { user } = useAuth();
  const { currentPlan } = usePlanSubscription(user?.id);
  
  const handleTabClick = (index: number) => {
    // Check if trying to access Assistant tab (index 1) with a non-pro plan
    if (index === 1 && currentPlan !== 'pro') {
      toast.error("The Assistant feature requires a Pro plan subscription");
      return;
    }
    
    onTabClick(index);
  };
  
  return (
    <div className="flex gap-[34px] px-[23px] py-[15px]">
      <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
        Setup
      </NavTab>

      <div className="relative">
        <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
          Assistant
        </NavTab>
        {currentPlan !== 'pro' && (
          <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-amber-500">
            <Lock size={14} />
          </span>
        )}
      </div>
    </div>
  );
};
