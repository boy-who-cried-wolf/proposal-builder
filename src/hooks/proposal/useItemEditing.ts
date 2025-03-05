
import { useState } from "react";
import { EditingItem } from "@/types/mainContent";
import { useToast } from "@/hooks/use-toast";
import { ProposalSection } from "@/types/proposal";
import { recalculateSubtotals, adjustSectionsToMatchBudget, createRevisionRecord } from "@/utils/proposal/sectionManagement";
import { Revision } from "@/components/proposal/RevisionsTab";

export function useItemEditing(
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

  const addItem = (sectionIndex: number) => {
    // Create a new empty item
    const newItem = {
      item: "New Task",
      description: "Description of the new task",
      hours: "1",
      price: `$${hourlyRate}`
    };

    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [
        ...newSections[sectionIndex].items,
        newItem,
      ],
    };

    // Update sections state
    setSections(newSections);
    
    // Recalculate subtotals
    recalculateSubtotals(newSections);

    // Create revision record
    const newRevision = createRevisionRecord(
      sections[sectionIndex].title,
      newItem.item,
      'item',
      'None',
      'Added'
    );
    setRevisions(prev => [newRevision, ...prev]);

    // Open the edit dialog for the new item
    openEditDialog(sectionIndex, newSections[sectionIndex].items.length - 1);

    toast({
      title: "Item added",
      description: `Added new task to ${sections[sectionIndex].title}`,
    });
  };

  const handleItemChange = (field: keyof EditingItem["item"], value: string) => {
    if (!editingItem) return;

    const updatedItem = { ...editingItem.item, [field]: value };

    if (field === 'hours' && isHoursPriceLocked) {
      const hours = parseInt(value, 10);
      if (!isNaN(hours)) {
        updatedItem.hours = hours.toString();
        const priceValue = hours * hourlyRate;
        updatedItem.price = `$${priceValue}`;
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

    if (item.hours) {
      const hours = parseInt(item.hours.toString(), 10);
      if (!isNaN(hours)) {
        item.hours = hours.toString();
        if (isHoursPriceLocked) {
          const priceValue = hours * hourlyRate;
          item.price = `$${priceValue}`;
        }
      }
    }
    console.log(item)

    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [
        ...newSections[sectionIndex].items.slice(0, itemIndex),
        item as any,
        ...newSections[sectionIndex].items.slice(itemIndex + 1),
      ],
    };

    recalculateSubtotals(newSections);

    if (projectBudget > 0) {
      const currentTotal = calculateTotalFromSections(newSections);
      if (currentTotal !== projectBudget) {
        // adjustSectionsToMatchBudget(newSections, projectBudget, hourlyRate, isHoursPriceLocked);
      }
    }

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

  return {
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
  };
}

export function calculateTotalFromSections(sections: ProposalSection[]): number {
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
