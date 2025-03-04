
import { useState } from "react";
import { ProposalSection, ProposalInput } from "@/types/proposal";
import { generateProposal } from "@/utils/proposal/generateProposal";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";

export function useProposalGeneration(
  projectDescription: string,
  hourlyRate: number,
  projectType: string,
  projectBudget: number,
  dateRange: DateRange | undefined,
  freelancerRate: number,
  services?: Array<string>,
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number, services?: Array<string>) => void
) {
  const { toast } = useToast();
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);

  const handleStreamUpdate = (sections: ProposalSection[]) => {
    // Update the local state with the latest sections
    setProposalSections(sections);

    // Calculate a progress indicator (this is just an estimate)
    setStreamProgress(Math.min(95, streamProgress + 5)); // Cap at 95% until fully complete

    // Send the current state up to parent component
    if (onProposalGenerated) {
      onProposalGenerated(sections, projectDescription, projectType, hourlyRate, freelancerRate, services);
    }
  };

  const generateProposalContent = async () => {
    // Validate inputs first
    if (!projectDescription) {
      toast({
        title: "Error",
        description: "Please provide a project description",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Please provide a project timeline with start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setStreamProgress(0);
    setProposalSections([]);

    try {
      const input: ProposalInput = {
        projectDescription,
        hourlyRate,
        projectType,
        projectBudget,
        dateRange,
        freelancerRate
      };

      const sections = await generateProposal(input, handleStreamUpdate);

      // Final update with complete result
      setProposalSections(sections);
      setStreamProgress(100);

      // Pass the generated proposal data to the parent component
      if (onProposalGenerated) {
        onProposalGenerated(sections, projectDescription, projectType, hourlyRate, freelancerRate);
      }

      toast({
        title: "Success",
        description: "Proposal generated successfully!",
      });
    } catch (error) {
      console.error("Error generating proposal:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate proposal",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    proposalSections,
    isGenerating,
    streamProgress,
    generateProposalContent
  };
}
