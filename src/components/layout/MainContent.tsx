
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
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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
}) => {
  const { user } = useAuth();
  
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
    generatedProposalSections,
    projectDescription,
    projectType,
    hourlyRate,
    freelancerRate,
    projectBudget,
    dateRange
  );

  const renderTabContent = () => {
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
            {!user && sections.length > 0 && (
              <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center bg-black/30 z-10">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                  <h3 className="text-xl font-bold mb-3">Sign Up to View Full Results</h3>
                  <p className="mb-6">Create an account or sign in to see your complete proposal.</p>
                  <div className="flex flex-col space-y-3">
                    <Link to="/auth" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                      Sign Up / Login
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="relative">
            <RevisionsTab revisions={revisions} />
            
            {/* Authentication overlay for non-authenticated users */}
            {!user && revisions.length > 0 && (
              <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center bg-black/30 z-10">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                  <h3 className="text-xl font-bold mb-3">Sign Up to View Revisions</h3>
                  <p className="mb-6">Create an account or sign in to see your proposal revision history.</p>
                  <div className="flex flex-col space-y-3">
                    <Link to="/auth" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                      Sign Up / Login
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
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
            handleCopyToFigma={handleCopyToFigma}
            proposalHistory={proposalHistory}
            onRevertProposal={onRevertProposal}
            isSaving={isSaving}
            isCopying={isCopying}
          />
        </div>
      </header>

      <nav className="flex gap-[34px] px-[23px] py-[15px]">
        <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
          Proposal
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
        hoursPerDayValue={getHoursPerDayValue()}
        totalValue={getTotalValueDisplay()}
        monthlyRevenue={calculateMonthlyRevenue()}
        profitMargin={calculateProfitMargin().display}
        profitMarginValue={calculateProfitMargin().value}
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
