
import React from "react";
import { ProposalContent } from "@/components/proposal/ProposalContent";
import { RevisionsTab } from "@/components/proposal/RevisionsTab";
import { MetricsTab } from "@/components/proposal/MetricsTab";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ProposalSection } from "@/types/proposal";

interface TabContentProps {
  activeTab: number;
  sections: ProposalSection[];
  revisions: any[];
  openEditDialog: (sectionIndex: number, itemIndex: number) => void;
  openSectionSettings: (sectionIndex: number) => void;
}

export const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  sections, 
  revisions,
  openEditDialog,
  openSectionSettings
}) => {
  const { user } = useAuth();

  const renderAuthOverlay = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none"></div>
      <div className="z-20 bg-white border-2 border-black py-3 px-6 text-center">
        <h3 className="text-xl font-bold">SIGN IN OR LOGIN TO CONTINUE</h3>
      </div>
      
      <Link 
        to="/auth" 
        className="mt-6 z-20 bg-black text-white py-2 px-4 font-semibold rounded hover:bg-black/80 transition-colors"
      >
        Sign In / Create Account
      </Link>
    </div>
  );

  switch (activeTab) {
    case 0:
      return (
        <div className="relative">
          <ProposalContent 
            sections={sections} 
            onEditItem={openEditDialog} 
            onOpenSectionSettings={openSectionSettings}
          />
          
          {/* Authentication overlay for non-authenticated users */}
          {!user && sections.length > 0 && renderAuthOverlay()}
        </div>
      );
    case 1:
      return (
        <div className="relative">
          <RevisionsTab revisions={revisions} />
          
          {/* Authentication overlay for non-authenticated users */}
          {!user && revisions.length > 0 && renderAuthOverlay()}
        </div>
      );
    case 2:
      return <MetricsTab />;
    default:
      return null;
  }
};
