
import { useState } from "react";
import { ProposalSection } from "@/types/proposal";
import { EditingItem } from "@/types/mainContent";
import { useToast } from "@/hooks/use-toast";
import { recalculateSubtotals, adjustSectionsToMatchBudget, createRevisionRecord } from "@/utils/proposal/sectionManagement";
import { Revision } from "@/components/proposal/RevisionsTab";

export function useProposalEditing(
  sections: ProposalSection[],
  setSections: React.Dispatch<React.SetStateAction<ProposalSection[]>>,
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>,
  hourlyRate: number,
  projectBudget: number = 0
) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isHoursPriceLocked, setIsHoursPriceLocked] = useState(true);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  const openEditDialog = (sectionIndex: number, itemIndex: number) => {
    const item = { ...sections[sectionIndex].items[itemIndex] };
    const formattedItem = {
      ...item,
      hours: item.hours.toString(),
      price: item.price.toString()
    };
    
    setEditingItem({
      sectionIndex,
      itemIndex,
      item: formattedItem as any,
    });
    
    setIsEditDialogOpen(true);
  };

  const openSectionSettings = (sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex);
    setIsSectionEditorOpen(true);
  };

  const handleItemChange = (field: keyof EditingItem["item"], value: string) => {
    if (!editingItem) return;

    const updatedItem = { ...editingItem.item, [field]: value };

    if (field === 'hours' && isHoursPriceLocked) {
      const hours = parseFloat(value);
      if (!isNaN(hours)) {
        const priceValue = hours * hourlyRate;
        updatedItem.price = `$${Math.round(priceValue)}`;
      }
    }

    setEditingItem({
      ...editingItem,
      item: updatedItem,
    });
  };

  const saveItemChanges = () => {
    if (!editingItem) return;

    const { sectionIndex, itemIndex, item } = editingItem;
    const oldItem = sections[sectionIndex].items[itemIndex];
    
    // Process hours to ensure it's formatted correctly
    if (item.hours) {
      const hours = parseFloat(item.hours.toString());
      if (!isNaN(hours)) {
        // Round to 1 decimal place
        item.hours = Math.round(hours * 10) / 10 + '';
      }
    }
    
    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [
        ...newSections[sectionIndex].items.slice(0, itemIndex),
        item as any,
        ...newSections[sectionIndex].items.slice(itemIndex + 1),
      ],
    };

    // Recalculate subtotals for all sections
    recalculateSubtotals(newSections);

    // Match budget if needed
    if (projectBudget > 0) {
      const currentTotal = calculateTotalFromSections(newSections);
      if (currentTotal !== projectBudget) {
        adjustSectionsToMatchBudget(newSections, projectBudget, hourlyRate, isHoursPriceLocked);
      }
    }

    // Create revisions for changed fields
    Object.keys(item).forEach((key) => {
      const field = key as keyof typeof item;
      if (item[field] !== oldItem[field]) {
        const newRevision = createRevisionRecord(
          sections[sectionIndex].title,
          item.item,
          field,
          String(oldItem[field]),
          String(item[field])
        );
        setRevisions(prev => [newRevision, ...prev]);
      }
    });

    setSections(newSections);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Changes saved",
      description: `Updated ${item.item} in ${sections[sectionIndex].title}`,
    });
  };

  const deleteItem = () => {
    if (!editingItem) return;

    const { sectionIndex, itemIndex, item } = editingItem;
    
    const newSections = [...sections];
    const oldItems = [...newSections[sectionIndex].items];
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [
        ...oldItems.slice(0, itemIndex),
        ...oldItems.slice(itemIndex + 1),
      ],
    };

    const newRevision = createRevisionRecord(
      sections[sectionIndex].title,
      item.item,
      'item',
      item.item,
      'Deleted'
    );
    setRevisions(prev => [newRevision, ...prev]);

    setSections(newSections);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Item deleted",
      description: `Removed ${item.item} from ${sections[sectionIndex].title}`,
    });
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
  };

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

// Helper function to avoid circular dependency
function calculateTotalFromSections(sections: ProposalSection[]): number {
  let total = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        total += price;
      }
    });
  });
  return total;
}
