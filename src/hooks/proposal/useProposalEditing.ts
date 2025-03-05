
import { useItemEditing } from "@/hooks/proposal/useItemEditing";
import { useSectionEditing } from "@/hooks/proposal/useSectionEditing";
import { ProposalSection } from "@/types/proposal";
import { Revision } from "@/components/proposal/RevisionsTab";
import { createRevisionRecord } from "@/utils/proposal/sectionManagement";

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
    deleteItem,
    addItem
  } = useItemEditing(sections, setSections, setRevisions, hourlyRate, projectBudget);

  const {
    isSectionEditorOpen,
    editingSectionIndex,
    openSectionSettings,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen
  } = useSectionEditing(sections, setSections, setRevisions);

  const addSection = () => {
    const newSection: ProposalSection = {
      title: "New Section",
      items: [],
      subtotal: "$0"
    };

    const newSections = [...sections, newSection];
    setSections(newSections);

    // Record the change in revisions
    const newRevision = createRevisionRecord(
      "Proposal",
      "Section",
      "add",
      "",
      "New Section"
    );
    setRevisions(prev => [newRevision, ...prev]);
  };

  const reorderSections = (startIndex: number, endIndex: number) => {
    const result = Array.from(sections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setSections(result);

    // Record the change in revisions
    const newRevision = createRevisionRecord(
      sections[startIndex].title,
      "Section",
      "order",
      `Position ${startIndex + 1}`,
      `Position ${endIndex + 1}`
    );
    setRevisions(prev => [newRevision, ...prev]);
  };

  const reorderItems = (sectionIndex: number, startIndex: number, endIndex: number) => {
    const section = sections[sectionIndex];
    const newItems = Array.from(section.items);
    const [removed] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, removed);

    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...section,
      items: newItems
    };

    setSections(newSections);

    // Record the change in revisions
    const newRevision = createRevisionRecord(
      sections[sectionIndex].title,
      section.items[startIndex].item,
      "order",
      `Position ${startIndex + 1}`,
      `Position ${endIndex + 1}`
    );
    setRevisions(prev => [newRevision, ...prev]);
  };

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
    setIsSectionEditorOpen,
    addItem,
    addSection,
    reorderSections,
    reorderItems
  };
}

// Re-export the calculateTotalFromSections function from useItemEditing
export { calculateTotalFromSections } from "@/hooks/proposal/useItemEditing";
