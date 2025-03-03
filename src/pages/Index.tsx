
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MiddleSection } from "@/components/layout/MiddleSection";
import { MainContent } from "@/components/layout/MainContent";
import { ProposalSection } from "@/utils/openaiProposal";
import { Toaster } from "@/components/ui/toaster";
import { DateRange } from "react-day-picker";

const Index = () => {
  const [generatedProposalSections, setGeneratedProposalSections] = useState<ProposalSection[]>([]);
  const [proposalHistory, setProposalHistory] = useState<ProposalSection[][]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [freelancerRate, setFreelancerRate] = useState(0);
  const [projectBudget, setProjectBudget] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleProposalGenerated = (
    sections: ProposalSection[], 
    description: string, 
    type: string, 
    rate: number,
    freelancerRate: number
  ) => {
    // Save the current proposal to history if it exists
    if (generatedProposalSections.length > 0) {
      setProposalHistory(prev => [...prev, [...generatedProposalSections]]);
    }
    
    setGeneratedProposalSections(sections);
    setProjectDescription(description);
    setProjectType(type);
    setHourlyRate(rate);
    setFreelancerRate(freelancerRate);
    
    // Get the project budget and date range from the form
    const form = document.querySelector('form');
    if (form) {
      const budgetInput = form.querySelector('input[type="number"][min="100"]') as HTMLInputElement;
      if (budgetInput) {
        setProjectBudget(Number(budgetInput.value));
      }
      
      // Get the date range from the button text
      const dateRangeButton = form.querySelector('button[class*="justify-start"]');
      if (dateRangeButton && dateRangeButton.textContent) {
        const text = dateRangeButton.textContent.trim();
        if (text !== "Select date range") {
          const dates = text.split(' - ');
          if (dates.length === 2) {
            setDateRange({
              from: new Date(dates[0]),
              to: new Date(dates[1])
            });
          }
        }
      }
    }
  };

  const handleUpdateProposal = (updatedSections: ProposalSection[]) => {
    // Save the current proposal to history before updating
    setProposalHistory(prev => [...prev, [...generatedProposalSections]]);
    setGeneratedProposalSections(updatedSections);
  };

  const handleRevertProposal = (index: number) => {
    if (proposalHistory[index]) {
      setGeneratedProposalSections([...proposalHistory[index]]);
      
      // Remove all history up to the reverted point
      setProposalHistory(prev => prev.slice(0, index));
    }
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
      />
      <div className="flex w-full h-screen bg-white max-md:flex-col">
        <Sidebar />
        <MiddleSection 
          onProposalGenerated={handleProposalGenerated} 
          proposalSections={generatedProposalSections}
          onUpdateProposal={handleUpdateProposal}
        />
        <MainContent 
          generatedProposalSections={generatedProposalSections}
          projectDescription={projectDescription}
          projectType={projectType}
          hourlyRate={hourlyRate}
          freelancerRate={freelancerRate}
          projectBudget={projectBudget}
          dateRange={dateRange}
          proposalHistory={proposalHistory}
          onRevertProposal={handleRevertProposal}
        />
      </div>
      <Toaster />
    </>
  );
};

export default Index;
