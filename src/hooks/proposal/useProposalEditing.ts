
import { useItemEditing } from "@/hooks/proposal/useItemEditing";
import { useSectionEditing } from "@/hooks/proposal/useSectionEditing";
import { ProposalSection } from "@/types/proposal";
import { Revision } from "@/components/proposal/RevisionsTab";

export function useProposalEditing(
  sections: ProposalSection[],
  setSections: React.Dispatch<React.SetStateAction<ProposalSection[]>>,
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>,
  hourlyRate: number,
  projectBudget: number = 0
) {
  // Use our smaller, focused hooks
  const {
    isEditDialogOpen,
    editingItem,
    isHoursPriceLocked,
    openEditDialog,
    setIsEditDialogOpen,
    handleItemChange,
    setIsHoursPriceLocked,
    saveItemChanges,
    deleteItem
  } = useItemEditing(sections, setSections, setRevisions, hourlyRate, projectBudget);

  const {
    isSectionEditorOpen,
    editingSectionIndex,
    openSectionSettings,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen
  } = useSectionEditing(sections, setSections, setRevisions);

  // Combine and return all functionality
  return {
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
    setIsSectionEditorOpen
  };
}

// Re-export the calculateTotalFromSections function from useItemEditing
export { calculateTotalFromSections } from "@/hooks/proposal/useItemEditing";
