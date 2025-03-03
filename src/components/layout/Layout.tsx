
import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MiddleSection } from "@/components/layout/MiddleSection";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
