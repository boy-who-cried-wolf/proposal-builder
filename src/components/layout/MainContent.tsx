import React from "react";
import { useProposalContent } from "@/hooks/useProposalContent";
import { ProposalHeader } from "@/components/proposal/ProposalHeader";
import { ProposalNavigation } from "@/components/proposal/ProposalNavigation";
import { TabContent } from "@/components/proposal/TabContent";
import { ProposalFooter } from "@/components/proposal/ProposalFooter";
import { ProposalDialogs } from "@/components/proposal/ProposalDialogs";
import { MainContentProps } from "@/types/mainContent";

export const MainContent: React.FC<MainContentProps> = ({
  generatedProposalSections,
  projectDescription,
  projectType,
  hourlyRate,
  freelancerRate = 0,
  projectBudget = 0,
  dateRange,
  proposalHistory,
  onRevertProposal,
  children
}) => {
  if (children) {
    return <main className="grow flex flex-col max-md:h-screen">{children}</main>;
  }

  const {
    activeTab,
    activeHeaderTab,
    isSaving,
    isCopying,
    sections,
    isEditDialogOpen,
    editingItem,
    isHoursPriceLocked,
    revisions,
    isSectionEditorOpen,
    editingSectionIndex,
    handleTabClick,
    handleHeaderTabChange,
    getTotalHoursDisplay,
    getHoursPerDayDisplay,
    getHoursPerDayValue,
    getTotalValueDisplay,
    calculateMonthlyRevenue,
    calculateProfitMargin,
    handleSaveProposal,
    handleCopyToFigma,
    openEditDialog,
    openSectionSettings,
    setIsEditDialogOpen,
    handleItemChange,
    setIsHoursPriceLocked,
    saveItemChanges,
    deleteItem,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen
  } = useProposalContent(
    generatedProposalSections || [],
    projectDescription || "",
    projectType || "",
    hourlyRate || 0,
    freelancerRate,
    projectBudget,
    dateRange
  );

  return (
    <main className="grow flex flex-col max-md:h-screen">
      <ProposalHeader
        activeHeaderTab={activeHeaderTab}
        handleHeaderTabChange={handleHeaderTabChange}
        handleSaveProposal={handleSaveProposal}
        handleCopyToFigma={handleCopyToFigma}
        proposalHistory={proposalHistory}
        onRevertProposal={onRevertProposal}
        isSaving={isSaving}
        isCopying={isCopying}
      />

      <ProposalNavigation
        activeTab={activeTab}
        handleTabClick={handleTabClick}
      />

      <div className="grow overflow-y-auto px-[23px] py-[15px]">
        <TabContent
          activeTab={activeTab}
          sections={sections}
          revisions={revisions}
          openEditDialog={openEditDialog}
          openSectionSettings={openSectionSettings}
        />
      </div>

      <ProposalFooter 
        totalHours={getTotalHoursDisplay()}
        hoursPerDay={getHoursPerDayDisplay()}
        hoursPerDayValue={getHoursPerDayValue()}
        totalValue={getTotalValueDisplay()}
        monthlyRevenue={calculateMonthlyRevenue()}
        profitMargin={calculateProfitMargin().display}
        profitMarginValue={calculateProfitMargin().value}
      />

      <ProposalDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editingItem={editingItem}
        isHoursPriceLocked={isHoursPriceLocked}
        setIsHoursPriceLocked={setIsHoursPriceLocked}
        handleItemChange={handleItemChange}
        saveItemChanges={saveItemChanges}
        hourlyRate={hourlyRate || 0}
        deleteItem={deleteItem}
        isSectionEditorOpen={isSectionEditorOpen}
        setIsSectionEditorOpen={setIsSectionEditorOpen}
        editingSectionIndex={editingSectionIndex}
        sections={sections}
        updateSection={updateSection}
        deleteSection={deleteSection}
      />
    </main>
  );
};
