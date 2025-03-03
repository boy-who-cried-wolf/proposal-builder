import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { MetricItem } from "@/components/ui/MetricItem";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveProposal, ProposalSection } from "@/utils/openaiProposal";
import { ProposalTable } from "@/components/proposal/ProposalTable";
import { TaskEditor } from "@/components/proposal/TaskEditor";
import { SectionEditor } from "@/components/proposal/SectionEditor";
import { RevisionsTab, Revision } from "@/components/proposal/RevisionsTab";
import { MetricsTab } from "@/components/proposal/MetricsTab";
import { ProposalHeaderTabs } from "@/components/proposal/ProposalHeaderTabs";

interface TaskItem {
  item: string;
  description: string;
  hours: string;
  price: string;
}

interface MainContentProps {
  generatedProposalSections: ProposalSection[];
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
}

export const MainContent: React.FC<MainContentProps> = ({
  generatedProposalSections,
  projectDescription,
  projectType,
  hourlyRate,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [activeHeaderTab, setActiveHeaderTab] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<ProposalSection[]>(generatedProposalSections);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    sectionIndex: number;
    itemIndex: number;
    item: TaskItem;
  } | null>(null);
  const [isHoursPriceLocked, setIsHoursPriceLocked] = useState(true);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);

  React.useEffect(() => {
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

  const calculateHoursPerDay = (): number => {
    const totalHours = calculateTotalHours();
    return totalHours > 0 ? parseFloat((totalHours / 5).toFixed(1)) : 0;
  };

  const calculateTotalValue = (): string => {
    let total = 0;
    sections.forEach(section => {
      section.items.forEach(item => {
        const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
        if (!isNaN(price)) {
          total += price;
        }
      });
    });
    return `$${total.toLocaleString()}`;
  };

  const getTotalHoursDisplay = (): string => {
    return calculateTotalHours().toString();
  };

  const getHoursPerDayDisplay = (): string => {
    return calculateHoursPerDay().toString();
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
      item: formattedItem as TaskItem,
    });
    
    setIsEditDialogOpen(true);
  };

  const openSectionSettings = (sectionIndex: number) => {
    setEditingSectionIndex(sectionIndex);
    setIsSectionEditorOpen(true);
  };

  const handleItemChange = (field: keyof TaskItem, value: string) => {
    if (!editingItem) return;

    const updatedItem = { ...editingItem.item, [field]: value };

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

    Object.keys(item).forEach((key) => {
      const field = key as keyof TaskItem;
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            {sections.length > 0 ? (
              <ProposalTable 
                sections={sections} 
                onEditItem={openEditDialog} 
                onOpenSectionSettings={openSectionSettings}
              />
            ) : (
              <div className="p-6 bg-[#F7F6F2] rounded-md text-center">
                <p className="text-gray-600">No proposal generated yet. Use the Project Settings tab to generate a proposal.</p>
              </div>
            )}
          </>
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

      <footer className="flex justify-between bg-[#F7F6F2] px-[17px] py-[15px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
        <MetricItem value={getTotalHoursDisplay()} label="Total Hours" />
        <MetricItem value={getHoursPerDayDisplay()} label="Hours/Day" />
        <MetricItem value="$5,500" label="Monthly Revenue" />
        <MetricItem value="45%" label="Profit Margin" />
        <MetricItem value={calculateTotalValue()} label="Total Value" />
      </footer>

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
