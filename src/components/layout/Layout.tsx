
import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
