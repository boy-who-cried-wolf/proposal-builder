import { useState, useEffect } from "react";
import { ProposalSection } from "@/utils/openaiProposal";
import { EditingItem } from "@/types/mainContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveProposal } from "@/utils/openaiProposal";
import { Revision } from "@/components/proposal/RevisionsTab";
import { formatProposalForFigma } from "@/utils/proposal/formatProposalForFigma";
import { differenceInBusinessDays } from "date-fns";

export function useProposalContent(
  generatedProposalSections: ProposalSection[],
  projectDescription: string,
  projectType: string,
  hourlyRate: number,
  freelancerRate: number = 0,
  projectBudget: number = 0,
  dateRange?: { from: Date; to?: Date }
) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [activeHeaderTab, setActiveHeaderTab] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [sections, setSections] = useState<ProposalSection[]>(generatedProposalSections);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isHoursPriceLocked, setIsHoursPriceLocked] = useState(true);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  useEffect(() => {
    setSections(generatedProposalSections);
  }, [generatedProposalSections]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleHeaderTabChange = (index: number | null) => {
    setActiveHeaderTab(index);
  };

  const calculateTotalHours = (): number => {
    let total = 0;
    sections.forEach(section => {
      section.items.forEach(item => {
        const hours = parseFloat(item.hours.toString());
        if (!isNaN(hours)) {
          total += hours;
        }
      });
    });
    return total;
  };

  const calculateTotalWorkingDays = (): number => {
    if (!dateRange?.from || !dateRange?.to) {
      return 0;
    }
    return differenceInBusinessDays(dateRange.to, dateRange.from) + 1;
  };

  const calculateHoursPerDay = (): number => {
    const totalHours = calculateTotalHours();
    const workingDays = calculateTotalWorkingDays();
    return workingDays > 0 ? parseFloat((totalHours / workingDays).toFixed(1)) : 0;
  };

  const calculateTotalValue = (): number => {
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
  };

  const calculateMonthlyRevenue = (): string => {
    const totalValue = calculateTotalValue();
    const workingDays = calculateTotalWorkingDays();
    
    if (workingDays <= 0) {
      return "$0";
    }
    
    const monthlyWorkingDays = 22;
    const monthlyRevenue = totalValue * (monthlyWorkingDays / workingDays);
    
    return `$${monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const calculateProfitMargin = (): { display: string; value: number } => {
    if (freelancerRate <= 0 || hourlyRate <= 0) {
      return { display: "0%", value: 0 };
    }

    const profitPerHour = hourlyRate - freelancerRate;
    const profitMarginPercent = (profitPerHour / hourlyRate) * 100;
    
    return { 
      display: `${profitMarginPercent.toFixed(0)}%`,
      value: Math.round(profitMarginPercent)
    };
  };

  const getTotalHoursDisplay = (): string => {
    return calculateTotalHours().toString();
  };

  const getHoursPerDayDisplay = (): string => {
    return calculateHoursPerDay().toString();
  };

  const getHoursPerDayValue = (): number => {
    return calculateHoursPerDay();
  };

  const getTotalValueDisplay = (): string => {
    const total = calculateTotalValue();
    return `$${total.toLocaleString()}`;
  };

  const handleSaveProposal = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to save proposals",
          variant: "destructive",
        });
        return;
      }

      if (sections.length === 0) {
        toast({
          title: "No proposal to save",
          description: "Please generate a proposal first",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      const result = await saveProposal({
        title: `Proposal for ${projectType} project`,
        projectDescription: projectDescription,
        projectType: projectType,
        hourlyRate: hourlyRate,
        freelancerRate: freelancerRate,
        sections: sections,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Proposal saved successfully! ID: ${result.id}`,
        });
        console.log("Proposal saved with ID:", result.id);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save proposal",
          variant: "destructive",
        });
        console.error("Error saving proposal:", result.error);
      }
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setActiveHeaderTab(null);
    }
  };

  const handleCopyToFigma = async () => {
    try {
      if (sections.length === 0) {
        toast({
          title: "No proposal to copy",
          description: "Please generate a proposal first",
          variant: "destructive",
        });
        return;
      }

      setIsCopying(true);

      const formattedText = formatProposalForFigma(
        sections,
        `Proposal for ${projectType} project`,
        projectType,
        hourlyRate
      );

      await navigator.clipboard.writeText(formattedText);

      const newRevision: Revision = {
        id: Date.now().toString(),
        date: new Date(),
        sectionTitle: "Proposal",
        itemName: "All",
        field: "copy",
        oldValue: "",
        newValue: "Copied to Figma",
      };
      setRevisions(prev => [newRevision, ...prev]);

      toast({
        title: "Copied to clipboard",
        description: "Proposal is ready to paste into Figma",
      });
    } catch (error) {
      console.error("Error copying to Figma:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to copy proposal to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
      setActiveHeaderTab(null);
    }
  };

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

    const totalBudget = projectBudget;
    
    if (field === 'hours' && isHoursPriceLocked) {
      const hours = parseFloat(value);
      if (!isNaN(hours)) {
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
    
    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      items: [
        ...newSections[sectionIndex].items.slice(0, itemIndex),
        item as any,
        ...newSections[sectionIndex].items.slice(itemIndex + 1),
      ],
    };

    newSections.forEach(section => {
      let subtotal = 0;
      section.items.forEach(item => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
        if (!isNaN(price)) {
          subtotal += price;
        }
      });
      section.subtotal = `$${subtotal.toLocaleString()}`;
    });

    if (projectBudget > 0) {
      const currentTotal = calculateTotalFromSections(newSections);
      if (currentTotal !== projectBudget) {
        adjustSectionsToMatchBudget(newSections, projectBudget);
      }
    }

    Object.keys(item).forEach((key) => {
      const field = key as keyof typeof item;
      if (item[field] !== oldItem[field]) {
        const newRevision: Revision = {
          id: Date.now().toString(),
          date: new Date(),
          sectionTitle: sections[sectionIndex].title,
          itemName: item.item,
          field,
          oldValue: String(oldItem[field]),
          newValue: String(item[field]),
        };
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

  const calculateTotalFromSections = (sections: ProposalSection[]): number => {
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
  };

  const adjustSectionsToMatchBudget = (sections: ProposalSection[], budget: number): void => {
    const currentTotal = calculateTotalFromSections(sections);
    if (currentTotal === 0) return;

    const ratio = budget / currentTotal;
    
    sections.forEach(section => {
      let sectionTotal = 0;
      
      section.items.forEach(item => {
        const originalPrice = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
        if (!isNaN(originalPrice)) {
          const newPrice = Math.round(originalPrice * ratio);
          item.price = `$${newPrice}`;
          sectionTotal += newPrice;
          
          if (isHoursPriceLocked && hourlyRate > 0) {
            const newHours = (newPrice / hourlyRate).toFixed(1);
            item.hours = newHours;
          }
        }
      });
      
      section.subtotal = `$${sectionTotal.toLocaleString()}`;
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

    const newRevision: Revision = {
      id: Date.now().toString(),
      date: new Date(),
      sectionTitle: sections[sectionIndex].title,
      itemName: item.item,
      field: 'item',
      oldValue: item.item,
      newValue: 'Deleted',
    };
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
      const newRevision: Revision = {
        id: Date.now().toString(),
        date: new Date(),
        sectionTitle: oldSection.title,
        itemName: 'Section',
        field: 'title',
        oldValue: oldSection.title,
        newValue: updatedSection.title,
      };
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

    const newRevision: Revision = {
      id: Date.now().toString(),
      date: new Date(),
      sectionTitle: sectionToDelete.title,
      itemName: 'Section',
      field: 'title',
      oldValue: sectionToDelete.title,
      newValue: 'Deleted',
    };
    setRevisions(prev => [newRevision, ...prev]);

    setSections(newSections);
  };

  return {
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
  };
}
