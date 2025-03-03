import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { MetricItem } from "@/components/ui/MetricItem";
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import {
  Copy,
  Eye,
  Send,
  Timer,
  DiamondPlus,
  Save,
  Pencil,
  Lock,
  Unlock,
  Check,
} from "lucide-react";
import { saveProposal, ProposalSection } from "@/utils/openaiProposal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TaskItem {
  item: string;
  description: string;
  hours: number | string;
  price: string | number;
}

interface MainContentProps {
  generatedProposalSections: ProposalSection[];
  projectDescription: string;
  projectType: string;
  hourlyRate: number;
}

type Revision = {
  id: string;
  date: Date;
  sectionTitle: string;
  itemName: string;
  field: string;
  oldValue: string;
  newValue: string;
};

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

      if (generatedProposalSections.length === 0) {
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
        sections: generatedProposalSections,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Proposal saved successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save proposal",
          variant: "destructive",
        });
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
    setEditingItem({
      sectionIndex,
      itemIndex,
      item: item as TaskItem,
    });
    setIsEditDialogOpen(true);
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
        item as TaskItem,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveItemChanges();
    }
  };

  const headerTabs: Tab[] = [
    { 
      title: "Add Section", 
      icon: DiamondPlus,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Add New Section</h2>
          <p>Here you can add a new section to your proposal.</p>
        </div>
      )
    },
    { 
      title: "Toggle Hours", 
      icon: Timer,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Hours Display Settings</h2>
          <p>Configure how hours are displayed in your proposal.</p>
        </div>
      )
    },
    { 
      title: "Preview", 
      icon: Eye,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Proposal Preview</h2>
          <p>Preview how your proposal will appear to clients.</p>
        </div>
      )
    },
    { 
      title: "Send", 
      icon: Send,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Send Proposal</h2>
          <p>Send this proposal to your client via email or generate a shareable link.</p>
        </div>
      )
    },
    { 
      title: "Copy", 
      icon: Copy,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Copy Proposal</h2>
          <p>Create a duplicate of this proposal as a starting point for a new one.</p>
        </div>
      )
    },
    { 
      title: "Save Proposal", 
      icon: Save,
      content: (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Save Proposal</h2>
          <p className="mb-4">Save your current proposal to your account.</p>
          <button 
            onClick={handleSaveProposal} 
            disabled={isSaving}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Proposal'} <Save size={16} />
          </button>
        </div>
      )
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            {sections.length > 0 && (
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index} className="section_wrapper mb-[34px]">
                    <div className="text-black text-lg font-bold bg-[#E1E1DC] px-[17px] py-[11px] rounded-[4px_4px_0_0]">
                      {section.title}
                    </div>
                    
                    <div className="section_table_header grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] text-black text-[9px] font-semibold tracking-[1.389px] uppercase px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Item
                      </div>
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Description
                      </div>
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Hours
                      </div>
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Price
                      </div>
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Edit
                      </div>
                    </div>

                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="section_table_row grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]"
                      >
                        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                          {item.item}
                        </div>
                        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                          {item.description}
                        </div>
                        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                          {item.hours}
                        </div>
                        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                          {item.price}
                        </div>
                        <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                          <button 
                            onClick={() => openEditDialog(index, itemIndex)} 
                            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                            aria-label="Edit item"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="section_table_footer grid grid-cols-[2fr_4fr_1fr_1fr_0.5fr] px-[29px] py-[11px] border-b-black border-b border-solid max-sm:grid-cols-[1fr] max-sm:gap-2.5 max-sm:p-[15px]">
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        Subtotal
                      </div>
                      <div className="section_table_cell text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
                        {section.subtotal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sections.length === 0 && (
              <div className="p-6 bg-[#F7F6F2] rounded-md text-center">
                <p className="text-gray-600">No proposal generated yet. Use the Project Settings tab to generate a proposal.</p>
              </div>
            )}
          </>
        );
      case 1:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Revisions</h2>
            {revisions.length > 0 ? (
              <div className="space-y-4">
                {revisions.map(revision => (
                  <div key={revision.id} className="bg-[#F7F6F2] p-4 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">
                      {revision.date.toLocaleString()}
                    </div>
                    <div className="font-medium">
                      {revision.sectionTitle} - {revision.itemName}
                    </div>
                    <div className="text-sm">
                      Changed {revision.field} from <span className="line-through">{revision.oldValue}</span> to <span className="font-semibold">{revision.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No revisions yet. Edit items in the proposal to track changes here.</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Metrics</h2>
            <p>View detailed metrics about your proposal performance.</p>
          </div>
        );
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
          <ExpandableTabs 
            tabs={headerTabs}
            className="border-gray-200"
            onChange={handleHeaderTabChange}
            showTabContent={activeHeaderTab !== null}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          {editingItem && (
            <div className="grid gap-4 py-4" onKeyDown={handleKeyDown}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item" className="text-right">
                  Task
                </Label>
                <Input
                  id="item"
                  value={editingItem.item.item}
                  onChange={(e) => handleItemChange('item', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={editingItem.item.description}
                  onChange={(e) => handleItemChange('description', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHoursPriceLocked(!isHoursPriceLocked)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label={isHoursPriceLocked ? "Unlock hours and price" : "Lock hours and price"}
                  >
                    {isHoursPriceLocked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <Label htmlFor="hours" className="">
                    Hours
                  </Label>
                </div>
                <Input
                  id="hours"
                  type="number"
                  value={editingItem.item.hours.toString()}
                  onChange={(e) => handleItemChange('hours', e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  value={editingItem.item.price.toString()}
                  onChange={(e) => handleItemChange('price', e.target.value)}
                  className="col-span-3"
                  disabled={isHoursPriceLocked}
                />
              </div>
              
              {isHoursPriceLocked && (
                <div className="text-xs text-gray-500 italic">
                  Price is calculated automatically based on hours at ${hourlyRate}/hour. Unlock to set custom price.
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveItemChanges} className="flex items-center gap-2">
              Save Changes <Check size={14} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
