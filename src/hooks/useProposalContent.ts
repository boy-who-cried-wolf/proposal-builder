
import { useState, useEffect } from "react";
import { ProposalSection } from "@/services/openaiProposal";
import { Revision } from "@/components/proposal/RevisionsTab";
import { useProposalEditing } from "@/hooks/proposal/useProposalEditing";
import { useProposalMetrics } from "@/hooks/proposal/useProposalMetrics";
import { useProposalActions } from "@/hooks/proposal/useProposalActions";
import useDeepCompareEffect from 'use-deep-compare-effect';

export function useProposalContent(
  generatedProposalSections: ProposalSection[],
  projectDescription: string,
  projectType: string,
  hourlyRate: number,
  freelancerRate: number = 0,
  projectBudget: number = 0,
  dateRange?: { from: Date; to?: Date },
) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeHeaderTab, setActiveHeaderTab] = useState<number | null>(null);
  const [sections, setSections] = useState<ProposalSection[]>(generatedProposalSections);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  // const jsonGeneratedProposalSections = JSON.stringify(generatedProposalSections)


  useDeepCompareEffect(() => {
    console.log('Sections updated:', generatedProposalSections);
    setSections(generatedProposalSections);
  }, [generatedProposalSections]); // Deep comparison of dependencies

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleHeaderTabChange = (index: number | null) => {
    setActiveHeaderTab(index);
  };

  // Use our smaller, specialized hooks
  const {
    isEditDialogOpen,
    editingItem,
    isHoursPriceLocked,
    isSectionEditorOpen,
    editingSectionIndex,
    openEditDialog,
    openSectionSettings,
    setIsEditDialogOpen,
    handleItemChange,
    setIsHoursPriceLocked,
    saveItemChanges,
    deleteItem,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen,
    addItem,
    addSection,
    reorderSections,
    reorderItems
  } = useProposalEditing(sections, setSections, setRevisions, hourlyRate, projectBudget);

  const {
    getTotalHoursDisplay,
    getHoursPerDayDisplay,
    getHoursPerDayValue,
    getTotalValueDisplay,
    getMonthlyRevenueDisplay,
    getProfitMargin
  } = useProposalMetrics(sections, hourlyRate, freelancerRate, dateRange);

  const {
    isSaving,
    isCopying,
    handleSaveProposal,
    handleCopyToFigma
  } = useProposalActions(sections, projectDescription, projectType, hourlyRate, freelancerRate, setRevisions);

  return {
    // Navigation state
    activeTab,
    activeHeaderTab,
    handleTabClick,
    handleHeaderTabChange,

    // Data
    sections,
    revisions,

    // Action states
    isSaving,
    isCopying,

    // Editing states
    isEditDialogOpen,
    editingItem,
    isHoursPriceLocked,
    isSectionEditorOpen,
    editingSectionIndex,

    // Metrics
    getTotalHoursDisplay,
    getHoursPerDayDisplay,
    getHoursPerDayValue,
    getTotalValueDisplay,
    calculateMonthlyRevenue: getMonthlyRevenueDisplay,
    calculateProfitMargin: getProfitMargin,

    // Actions
    handleSaveProposal,
    handleCopyToFigma,

    // Editing functions
    openEditDialog,
    openSectionSettings,
    setIsEditDialogOpen,
    handleItemChange,
    setIsHoursPriceLocked,
    saveItemChanges,
    deleteItem,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen,
    addItem,

    // New section functions
    addSection,
    reorderSections,
    reorderItems
  };
}
