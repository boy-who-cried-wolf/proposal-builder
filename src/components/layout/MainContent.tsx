
import React from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({ children, className }) => {
  const location = useLocation();
  
  // Check if the current route is account settings related to apply reduced padding
  const isAccountSettings = location.pathname.includes('account-settings');
  
  return (
    <main
      className={cn(
        "flex-1 overflow-auto",
        isAccountSettings ? "pl-0" : "pl-4", // Reduced padding for account settings pages
        className
      )}
    >
      {children}
    </main>
  );
};
