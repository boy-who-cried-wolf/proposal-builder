
import { useState } from "react";
import { ProposalSection } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveProposal } from "@/utils/openaiProposal";
import { formatProposalForFigma } from "@/utils/proposal/formatProposalForFigma";
import { Revision } from "@/components/proposal/RevisionsTab";

export function useProposalActions(
  sections: ProposalSection[],
  projectDescription: string,
  projectType: string,
  hourlyRate: number,
  freelancerRate: number = 0,
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>
) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

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

      toast({
        title: "Info",
        description: "Saving proposal ...",
      });
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
    }
  };

  return {
    isSaving,
    isCopying,
    handleSaveProposal,
    handleCopyToFigma
  };
}
