
import React, { useState, useEffect } from "react";
import { ProposalSection, ProposalInput } from "@/types/proposal"; 
import { useProposalGeneration } from "@/hooks/proposal/useProposalGeneration";
import { useProposalFormState } from "@/hooks/proposal/useProposalFormState";
import { ProposalFormInputs } from "./proposal/ProposalFormInputs";
import { ProposalFormActions } from "./proposal/ProposalFormActions";
import { ProposalProgressBar } from "./proposal/ProposalProgressBar";
import { AuthenticationDialog } from "./proposal/AuthenticationDialog";
import { useNavigate } from "react-router-dom";
import { saveProposalFormData, getSavedProposalFormData, clearSavedProposalFormData } from "@/utils/localStorage";
import { useAuth } from "@/contexts/AuthContext";

interface ProposalFormProps {
  onProposalGenerated?: (sections: ProposalSection[], description: string, type: string, rate: number, freelancerRate: number) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ onProposalGenerated }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    projectDescription, setProjectDescription,
    hourlyRate, setHourlyRate,
    freelancerRate, setFreelancerRate,
    projectBudget, setProjectBudget,
    projectType, setProjectType,
    dateRange, setDateRange
  } = useProposalFormState();
  
  const {
    proposalSections,
    isGenerating,
    streamProgress,
    generateProposalContent
  } = useProposalGeneration(
    projectDescription,
    hourlyRate,
    projectType,
    projectBudget,
    dateRange,
    freelancerRate,
    onProposalGenerated
  );

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
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
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
          <ProposalFormInputs 
            projectType={projectType}
            setProjectType={setProjectType}
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            freelancerRate={freelancerRate}
            setFreelancerRate={setFreelancerRate}
            projectBudget={projectBudget}
            setProjectBudget={setProjectBudget}
            dateRange={dateRange}
            setDateRange={setDateRange}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
          />
          
          <ProposalFormActions isGenerating={isGenerating} streamProgress={streamProgress} />
          
          {isGenerating && streamProgress > 0 && (
            <ProposalProgressBar streamProgress={streamProgress} />
          )}
        </form>
      </div>

      <AuthenticationDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onGoToAuth={handleGoToAuth}
      />
    </div>
  );
};
