
import React, { useState, useEffect } from "react";
import { ProposalSection, ProposalInput } from "@/types/proposal"; 
import { generateProposal } from "@/utils/proposal/generateProposal";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { ProjectTypeSelect } from "./ProjectTypeSelect";
import { NumericInput } from "./NumericInput";
import { DateRangePicker } from "./DateRangePicker";
import { ProjectDescriptionTextarea } from "./ProjectDescriptionTextarea";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { saveProposalFormData, getSavedProposalFormData, clearSavedProposalFormData } from "@/utils/localStorage";

interface ProposalFormProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ onProposalGenerated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [freelancerRate, setFreelancerRate] = useState(60);
  const [projectBudget, setProjectBudget] = useState(5000);
  const [projectType, setProjectType] = useState("Website");
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  // Check for saved form data on component mount
  useEffect(() => {
    const savedData = getSavedProposalFormData();
    if (savedData) {
      setProjectDescription(savedData.projectDescription);
      setProjectType(savedData.projectType);
      setHourlyRate(savedData.hourlyRate);
      setFreelancerRate(savedData.freelancerRate);
      setProjectBudget(savedData.projectBudget);
      
      if (savedData.dateRange) {
        setDateRange({
          from: new Date(savedData.dateRange.from),
          to: new Date(savedData.dateRange.to),
        });
      }
      
      // Clear saved data since we've restored it
      if (user) {
        clearSavedProposalFormData();
      }
    }
  }, [user]);

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

    // Check if user is authenticated
    if (!user) {
      // Save the current form data to localStorage before redirecting
      saveProposalFormData({
        projectDescription,
        projectType,
        hourlyRate,
        freelancerRate,
        projectBudget,
        dateRange: dateRange ? {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString()
        } : undefined
      });
      
      // Generate the proposal for the non-logged in user to preview
      await generateProposalContent();
      
      // Don't show the dialog - let them see the preview with the gradient overlay
      return;
    }

    // If we get here, user is authenticated, so proceed with proposal generation
    await generateProposalContent();
  };

  const handleStreamUpdate = (sections: ProposalSection[]) => {
    // Update the local state with the latest sections
    setProposalSections(sections);
    
    // Calculate a progress indicator (this is just an estimate)
    // You could make this more sophisticated based on the expected number of sections
    setStreamProgress(Math.min(95, streamProgress + 5)); // Cap at 95% until fully complete
    
    // Send the current state up to parent component
    if (onProposalGenerated) {
      onProposalGenerated(sections, projectDescription, projectType, hourlyRate, freelancerRate);
    }
  };

  const generateProposalContent = async () => {
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

  const handleGoToAuth = () => {
    // Save form data before navigating
    saveProposalFormData({
      projectDescription,
      projectType,
      hourlyRate,
      freelancerRate,
      projectBudget,
      dateRange: dateRange ? {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      } : undefined
    });
    
    navigate('/auth');
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
                <div className="flex items-center">
                  <span>Generating</span>
                  <span className="ml-1 animate-pulse">...</span>
                  {streamProgress > 0 && (
                    <span className="ml-2 text-xs">{streamProgress}%</span>
                  )}
                </div>
              ) : (
                <>
                  Generate Proposal <Send size={16} />
                </>
              )}
            </button>
          </div>
          
          {isGenerating && streamProgress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-black h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${streamProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to sign in or create an account to generate proposals.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 mt-4">
            <p className="text-sm text-gray-500">
              Proposal generation is a premium feature that requires authentication.
              Your proposal details have been saved and will be generated immediately after you sign in.
            </p>
            <button
              onClick={handleGoToAuth}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Sign In or Create Account
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
