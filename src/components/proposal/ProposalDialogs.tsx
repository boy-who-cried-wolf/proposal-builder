
import React from "react";
import { TaskEditor } from "@/components/proposal/TaskEditor";
import { SectionEditor } from "@/components/proposal/SectionEditor";
import { EditingItem } from "@/types/mainContent";
import { ProposalSection } from "@/types/proposal";

interface ProposalDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editingItem: EditingItem | null;
  isHoursPriceLocked: boolean;
  setIsHoursPriceLocked: (locked: boolean) => void;
  handleItemChange: (field: string, value: string) => void;
  saveItemChanges: () => void;
  hourlyRate: number;
  deleteItem: () => void;
  isSectionEditorOpen: boolean;
  setIsSectionEditorOpen: (open: boolean) => void;
  editingSectionIndex: number | null;
  sections: ProposalSection[];
  updateSection: (sectionIndex: number, updatedSection: Partial<ProposalSection>) => void;
  deleteSection: (index: number) => void;
}

export const ProposalDialogs: React.FC<ProposalDialogsProps> = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingItem,
  isHoursPriceLocked,
  setIsHoursPriceLocked,
  handleItemChange,
  saveItemChanges,
  hourlyRate,
  deleteItem,
  isSectionEditorOpen,
  setIsSectionEditorOpen,
  editingSectionIndex,
  sections,
  updateSection,
  deleteSection
}) => {
  return (
    <>
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
        onSave={(sectionIndex, updatedSection) => updateSection(sectionIndex, updatedSection)}
        onDelete={deleteSection}
      />
    </>
  );
};
