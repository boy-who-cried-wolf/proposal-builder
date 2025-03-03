
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";

export const Sidebar: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, signOut } = useAuth();

  const handleNavItemClick = (index: number) => {
    if (!isExpanded) return;
    setActiveNavItem(activeNavItem === index ? null : index);
  };

  const handleLogout = () => {
    signOut();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveNavItem(null);
    }
  };

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white border-r-black border-r border-solid transition-all duration-300 h-screen sticky top-0", 
        isExpanded ? "w-[254px]" : "w-[70px]"
      )}
    >
      <SidebarHeader 
        isExpanded={isExpanded} 
        toggleExpand={toggleExpand} 
      />

      <SidebarNavigation 
        activeNavItem={activeNavItem}
        isExpanded={isExpanded}
        onNavItemClick={handleNavItemClick}
      />

      <SidebarFooter 
        isExpanded={isExpanded}
        user={user}
        onLogout={handleLogout}
      />
    </aside>
  );
};
