
import React from "react";
import { ProposalContent } from "@/components/proposal/ProposalContent";
import { RevisionsTab } from "@/components/proposal/RevisionsTab";
import { MetricsTab } from "@/components/proposal/MetricsTab";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ProposalSection } from "@/types/proposal";
import { usePlanSubscription } from "@/hooks/usePlanSubscription";
import { Button } from "@/components/ui/button";
import { UpgradeOverlay } from "../UpgradeOverlay";
import { AuthOverlay } from "../AuthOverlay";

interface TabContentProps {
  activeTab: number;
  sections: ProposalSection[];
  revisions: any[];
  openEditDialog: (sectionIndex: number, itemIndex: number) => void;
  openSectionSettings: (sectionIndex: number) => void;
  addItem?: (sectionIndex: number) => void;
  reorderSections?: (startIndex: number, endIndex: number) => void;
  reorderItems?: (sectionIndex: number, startIndex: number, endIndex: number) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  sections,
  revisions,
  openEditDialog,
  openSectionSettings,
  addItem,
  reorderSections,
  reorderItems
}) => {
  const { user } = useAuth();
  const { currentPlan } = usePlanSubscription(user?.id);

  const hasReachedProposalLimit = () => {
    if (currentPlan === 'freelancer' && sections.length >= 3) {
      return true;
    }
    return false;
  };

  switch (activeTab) {
    case 0:
      return (
        <UpgradeOverlay open={user && hasReachedProposalLimit()} message={"You've reached the proposal limit for your current plan."}>
          <AuthOverlay open={!user && sections.length > 0}>
            <ProposalContent
              sections={sections}
              onEditItem={openEditDialog}
              onOpenSectionSettings={openSectionSettings}
              onAddItem={addItem}
              onReorderSections={reorderSections}
              onReorderItems={reorderItems}
            />
          </AuthOverlay>
        </UpgradeOverlay>
      );
    case 1:
      return (
        <UpgradeOverlay open={user && currentPlan !== 'pro'} message={"The AI Assistant feature is available exclusively with our Pro plan."}>
          <AuthOverlay open={!user && sections.length > 0}>
            <RevisionsTab revisions={revisions} />
          </AuthOverlay>
        </UpgradeOverlay>
      );
    case 2:
      return <MetricsTab />;
    default:
      return null;
  }
};
