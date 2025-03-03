
import React from "react";
import { NavTab } from "@/components/ui/NavItem";
import { useProposalContent } from "@/hooks/useProposalContent";
import { TaskEditor } from "@/components/proposal/TaskEditor";
import { SectionEditor } from "@/components/proposal/SectionEditor";
import { RevisionsTab } from "@/components/proposal/RevisionsTab";
import { MetricsTab } from "@/components/proposal/MetricsTab";
import { ProposalHeaderTabs } from "@/components/proposal/ProposalHeaderTabs";
import { ProposalContent } from "@/components/proposal/ProposalContent";
import { ProposalFooter } from "@/components/proposal/ProposalFooter";
import { MainContentProps } from "@/types/mainContent";

export const MainContent: React.FC<MainContentProps> = ({
  generatedProposalSections,
  projectDescription,
  projectType,
  hourlyRate,
}) => {
  const {
    activeTab,
    activeHeaderTab,
    isSaving,
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
    calculateTotalValue,
    handleSaveProposal,
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
    generatedProposalSections,
    projectDescription,
    projectType,
    hourlyRate
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <ProposalContent 
            sections={sections} 
            onEditItem={openEditDialog} 
            onOpenSectionSettings={openSectionSettings}
          />
        );
      case 1:
        return <RevisionsTab revisions={revisions} />;
      case 2:
        return <MetricsTab />;
      default:
        return null;
    }
  };

  return (
    <main className="grow flex flex-col max-md:h-screen">
      <header className="h-[69px] flex justify-between items-center px-[23px] py-[15px] border-b-black border-b border-solid">
        <h1 className="text-black text-[26px] font-bold max-sm:text-xl">
          proposal 1.0
        </h1>

        <div className="flex items-center">
          <ProposalHeaderTabs
            activeHeaderTab={activeHeaderTab}
            handleHeaderTabChange={handleHeaderTabChange}
            handleSaveProposal={handleSaveProposal}
            isSaving={isSaving}
          />
        </div>
      </header>

      <nav className="flex gap-[34px] px-[23px] py-[15px]">
        <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
          download
        </NavTab>

        <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
          Revisions
        </NavTab>

        <NavTab active={activeTab === 2} onClick={() => handleTabClick(2)}>
          Metrics
        </NavTab>
      </nav>

      <div className="grow overflow-y-auto px-[23px] py-[15px]">
        {renderTabContent()}
      </div>

      <ProposalFooter 
        totalHours={getTotalHoursDisplay()}
        hoursPerDay={getHoursPerDayDisplay()}
        totalValue={calculateTotalValue()}
      />

      <TaskEditor
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingItem={editingItem}
        isHoursPriceLocked={isHoursPriceLocked}
        setIsHoursPriceLocked={setIsHoursPriceLocked}
        handleItemChange={handleItemChange}
        saveItemChanges={saveItemChanges}
        hourlyRate={hourlyRate}
        deleteItem={deleteItem}
      />

      <SectionEditor
        isOpen={isSectionEditorOpen}
        onOpenChange={setIsSectionEditorOpen}
        section={editingSectionIndex !== null ? sections[editingSectionIndex] : null}
        sectionIndex={editingSectionIndex}
        onSave={updateSection}
        onDelete={deleteSection}
      />
    </main>
  );
};
