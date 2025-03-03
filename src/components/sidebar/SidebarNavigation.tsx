
import React, { useEffect, useState } from "react";
import { SidebarNavItem } from "./SidebarNavItem";
import { 
  Home,
  BarChart3,
  Settings,
  Users,
  FileText,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/integrations/supabase/profileService";

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
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const profile = await getUserProfile(user.id);
        setIsAdmin(profile?.is_admin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdmin();
  }, [user]);

  return (
    <div className="flex-grow overflow-y-auto">
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 0}
        onClick={() => onNavItemClick(0)}
        icon={Home}
        label="Home"
        path="/"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 1}
        onClick={() => onNavItemClick(1)}
        icon={FileText}
        label="Proposals"
        path="/"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 2}
        onClick={() => onNavItemClick(2)}
        icon={BarChart3}
        label="Dashboard"
        path="/dashboard"
      />
      {isAdmin && (
        <SidebarNavItem
          isExpanded={isExpanded}
          isActive={activeNavItem === 3}
          onClick={() => onNavItemClick(3)}
          icon={ShieldCheck}
          label="Admin"
          path="/admin"
        />
      )}
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 4}
        onClick={() => onNavItemClick(4)}
        icon={Settings}
        label="Settings"
        path="/account-settings"
      />
    </div>
  );
};
