
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
import { useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleNavigation = (index: number, path: string) => {
    onNavItemClick(index);
    navigate(path);
  };

  return (
    <div className="flex-grow overflow-y-auto">
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 0 || location.pathname === "/"}
        onClick={() => handleNavigation(0, "/")}
        icon={Home}
        label="Home"
        path="/"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 1 || location.pathname.includes("proposals")}
        onClick={() => handleNavigation(1, "/proposals")}
        icon={FileText}
        label="Proposals"
        path="/proposals"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 2 || location.pathname === "/dashboard"}
        onClick={() => handleNavigation(2, "/dashboard")}
        icon={BarChart3}
        label="Dashboard"
        path="/dashboard"
      />
      {isAdmin && (
        <SidebarNavItem
          isExpanded={isExpanded}
          isActive={activeNavItem === 3 || location.pathname === "/admin"}
          onClick={() => handleNavigation(3, "/admin")}
          icon={ShieldCheck}
          label="Admin"
          path="/admin"
        />
      )}
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 4 || location.pathname.includes("account-settings")}
        onClick={() => handleNavigation(4, "/account-settings")}
        icon={Settings}
        label="Settings"
        path="/account-settings"
      />
    </div>
  );
};
