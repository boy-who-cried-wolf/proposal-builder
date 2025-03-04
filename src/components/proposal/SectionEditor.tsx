
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Save, Trash } from "lucide-react";
import { ProposalSection } from "@/services/openaiProposal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SectionEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: ProposalSection | null;
  sectionIndex: number | null;
  onSave: (sectionIndex: number, updatedSection: Partial<ProposalSection>) => void;
  onDelete: (sectionIndex: number) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  isOpen,
  onOpenChange,
  section,
  sectionIndex,
  onSave,
  onDelete,
}) => {
  const { toast } = useToast();
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  React.useEffect(() => {
    if (section) {
      setSectionTitle(section.title);
      setSectionDescription(""); // Initialize with empty description as it's a new field
    }
  }, [section]);

  const handleSave = () => {
    if (sectionIndex === null || !section) return;
    
    onSave(sectionIndex, {
      ...section,
      title: sectionTitle,
    });
    
    toast({
      title: "Section Updated",
      description: "Section details have been updated"
    });
    
    onOpenChange(false);
  };

  const handleSaveTemplate = async () => {
    if (!section) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save templates",
          variant: "destructive",
        });
        return;
      }
      
      setIsSavingTemplate(true);
      
      const { data, error } = await supabase
        .from('section_templates')
        .insert({
          title: sectionTitle,
          description: sectionDescription,
          items: section.items,
          user_id: user.id
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Template Saved",
        description: "Section template has been saved for future use"
      });
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDelete = () => {
    if (sectionIndex === null) return;
    
    onDelete(sectionIndex);
    
    toast({
      title: "Section Deleted",
      description: "Section has been removed from the proposal"
    });
    
    onOpenChange(false);
  };

  if (!section || sectionIndex === null) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Section Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sectionTitle" className="text-right">
              Section Name
            </Label>
            <Input
              id="sectionTitle"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="sectionDescription" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="sectionDescription"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Enter a description for this section template"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-1"></div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate} 
              className="col-span-3 flex items-center justify-center gap-2"
            >
              {isSavingTemplate ? 'Saving...' : 'Save as Template'} <Save size={14} />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            Delete Section <Trash size={14} />
          </Button>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving} 
              className="flex items-center gap-2"
            >
              Update Section <Check size={14} />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
