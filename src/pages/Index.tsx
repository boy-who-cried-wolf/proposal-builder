
import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MiddleSection } from "@/components/layout/MiddleSection";
import { MainContent } from "@/components/layout/MainContent";
import { ProposalSection } from "@/utils/openaiProposal";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [generatedProposalSections, setGeneratedProposalSections] = useState<ProposalSection[]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);

  const handleProposalGenerated = (sections: ProposalSection[], description: string, type: string, rate: number) => {
    setGeneratedProposalSections(sections);
    setProjectDescription(description);
    setProjectType(type);
    setHourlyRate(rate);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
      />
      <div className="flex w-full h-screen bg-white max-md:flex-col">
        <Sidebar />
        <MiddleSection onProposalGenerated={handleProposalGenerated} />
        <MainContent 
          generatedProposalSections={generatedProposalSections}
          projectDescription={projectDescription}
          projectType={projectType}
          hourlyRate={hourlyRate}
        />
      </div>
      <Toaster />
    </>
  );
};

export default Index;
