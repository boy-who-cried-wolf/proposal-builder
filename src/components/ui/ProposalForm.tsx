
import React, { useState } from "react";
import { generateProposal, ProposalSection, ProposalInput } from "@/utils/openaiProposal";
import { TableSection } from "./TableSection";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

export const ProposalForm: React.FC = () => {
  const { toast } = useToast();
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

    setIsGenerating(true);
    
    try {
      const input: ProposalInput = {
        projectDescription,
        hourlyRate,
        projectType,
      };
      
      const sections = await generateProposal(input);
      setProposalSections(sections);
      
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
    <div className="section_wrapper mb-8">
      <div className="text-black text-lg font-bold bg-[#E1E1DC] px-[17px] py-[11px] rounded-[4px_4px_0_0]">
        Generate AI Proposal
      </div>
      
      <div className="p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4 max-sm:grid-cols-1">
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
      
      {proposalSections.length > 0 && (
        <div className="mt-8">
          {proposalSections.map((section, index) => (
            <TableSection
              key={index}
              title={section.title}
              items={section.items}
              subtotal={section.subtotal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
