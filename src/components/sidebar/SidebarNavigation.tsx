
import React, { useEffect, useState } from "react";
import { SidebarNavItem } from "./SidebarNavItem";
import { 
  Home,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkIsAdmin } from "@/integrations/supabase/profileService";
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

  // Consistent icon size for all navigation items
  const iconSize = 20;

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        // Use the dedicated admin check function to avoid RLS issues
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
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
        icon={(props) => <Home size={iconSize} {...props} />}
        label="Home"
        path="/"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 1 || location.pathname === "/dashboard"}
        onClick={() => handleNavigation(1, "/dashboard")}
        icon={(props) => <LayoutDashboard size={iconSize} {...props} />}
        label="Dashboard"
        path="/dashboard"
      />
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 2 || location.pathname === "/assistant"}
        onClick={() => handleNavigation(2, "/assistant")}
        icon={(props) => <MessageSquare size={iconSize} {...props} />}
        label="Assistant"
        path="/assistant"
      />
      {isAdmin && (
        <SidebarNavItem
          isExpanded={isExpanded}
          isActive={activeNavItem === 3 || location.pathname === "/admin"}
          onClick={() => handleNavigation(3, "/admin")}
          icon={(props) => <Shield size={iconSize} {...props} />}
          label="Admin"
          path="/admin"
        />
      )}
      <SidebarNavItem
        isExpanded={isExpanded}
        isActive={activeNavItem === 4 || location.pathname === "/settings"}
        onClick={() => handleNavigation(4, "/settings")}
        icon={(props) => <Settings size={iconSize} {...props} />}
        label="Settings"
        path="/settings"
      />
    </div>
  );
};
