
import React, { useState } from "react";
import { generateProposal, ProposalSection, ProposalInput } from "@/utils/openaiProposal";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { addDays, differenceInBusinessDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const projectTypes = [
  "Website",
  "Branding",
  "Mobile App",
  "E-commerce",
  "Marketing",
  "Content Writing",
  "UI/UX Design",
  "Graphic Design",
  "SEO",
  "Social Media",
  "Video Production",
  "Other"
];

interface ProposalFormProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ onProposalGenerated }) => {
  const { toast } = useToast();
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [freelancerRate, setFreelancerRate] = useState(60);
  const [projectBudget, setProjectBudget] = useState(5000);
  const [projectType, setProjectType] = useState(projectTypes[0]);
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
            <div>
              <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                min="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
              />
            </div>

            <div>
              <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
                Freelancer Rate ($)
              </label>
              <input
                type="number"
                min="1"
                value={freelancerRate}
                onChange={(e) => setFreelancerRate(Number(e.target.value))}
                className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
              />
            </div>

            <div>
              <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
                Project Budget ($)
              </label>
              <input
                type="number"
                min="100"
                value={projectBudget}
                onChange={(e) => setProjectBudget(Number(e.target.value))}
                className="w-full h-[39px] rounded border text-black text-[9px] font-semibold tracking-[1.389px] uppercase bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
              />
            </div>
            
            <div>
              <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
                Project Timeline
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-[39px] justify-start text-left font-normal border border-[#E1E1DC] bg-[#F7F6F2] text-[9px] font-semibold tracking-[1.389px] uppercase p-[11px]",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <label className="text-black text-[11px] font-semibold tracking-[1.389px] uppercase block mb-2">
              Project Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={5}
              placeholder="Describe your project in detail..."
              className="w-full rounded border text-black text-[9px] font-semibold tracking-[1.389px] bg-[#F7F6F2] p-[11px] border-solid border-[#E1E1DC]"
            />
          </div>
          
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
