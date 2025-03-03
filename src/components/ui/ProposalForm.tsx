
import React, { useState } from "react";
import { generateProposal, ProposalSection, ProposalInput } from "@/utils/openaiProposal";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { ProjectTypeSelect } from "./ProjectTypeSelect";
import { NumericInput } from "./NumericInput";
import { DateRangePicker } from "./DateRangePicker";
import { ProjectDescriptionTextarea } from "./ProjectDescriptionTextarea";

interface ProposalFormProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ onProposalGenerated }) => {
  const { toast } = useToast();
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [freelancerRate, setFreelancerRate] = useState(60);
  const [projectBudget, setProjectBudget] = useState(5000);
  const [projectType, setProjectType] = useState("Website");
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    try {
      const input: ProposalInput = {
        projectDescription,
        hourlyRate,
        projectType,
        projectBudget,
        dateRange,
        freelancerRate
      };
      
      const sections = await generateProposal(input);
      setProposalSections(sections);
      
      // Pass the generated proposal data back to the parent component
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

  return (
    <div className="mb-4">
      <div className="p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <ProjectTypeSelect 
              projectType={projectType}
              setProjectType={setProjectType}
            />
            
            <NumericInput
              label="Hourly Rate ($)"
              value={hourlyRate}
              onChange={setHourlyRate}
            />

            <NumericInput
              label="Freelancer Rate ($)"
              value={freelancerRate}
              onChange={setFreelancerRate}
            />

            <NumericInput
              label="Project Budget ($)"
              value={projectBudget}
              onChange={setProjectBudget}
              min={100}
            />
            
            <DateRangePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>
          
          <ProjectDescriptionTextarea
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
            >
              {isGenerating ? (
                <>Generating<span className="animate-pulse">...</span></>
              ) : (
                <>
                  Generate Proposal <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
