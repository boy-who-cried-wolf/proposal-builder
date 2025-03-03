
import { useState } from "react";
import { ProposalSection } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import { createRevisionRecord } from "@/utils/proposal/sectionManagement";
import { Revision } from "@/components/proposal/RevisionsTab";

export function useSectionEditing(
  sections: ProposalSection[],
  setSections: React.Dispatch<React.SetStateAction<ProposalSection[]>>,
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>
) {
  const { toast } = useToast();
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  const openSectionSettings = (sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex);
    setIsSectionEditorOpen(true);
  };

  const updateSection = (sectionIndex: number, updatedSection: Partial<ProposalSection>) => {
    const newSections = [...sections];
    const oldSection = newSections[sectionIndex];
    
    newSections[sectionIndex] = {
      ...oldSection,
      ...updatedSection,
    };

    if (updatedSection.title && updatedSection.title !== oldSection.title) {
      const newRevision = createRevisionRecord(
        oldSection.title,
        'Section',
        'title',
        oldSection.title,
        updatedSection.title
      );
      setRevisions(prev => [newRevision, ...prev]);
    }

    setSections(newSections);
  };

  const deleteSection = (sectionIndex: number) => {
    const sectionToDelete = sections[sectionIndex];
    
    const newSections = [
      ...sections.slice(0, sectionIndex),
      ...sections.slice(sectionIndex + 1),
    ];

    const newRevision = createRevisionRecord(
      sectionToDelete.title,
      'Section',
      'title',
      sectionToDelete.title,
      'Deleted'
    );
    setRevisions(prev => [newRevision, ...prev]);

    setSections(newSections);
    setIsSectionEditorOpen(false);
  };

  return {
    isSectionEditorOpen,
    editingSectionIndex,
    openSectionSettings,
    updateSection,
    deleteSection,
    setIsSectionEditorOpen
  };
}
