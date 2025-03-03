
import React, { useState } from "react";
import { NavTab } from "@/components/ui/NavItem";
import { TableSection } from "@/components/ui/TableSection";
import { MetricItem } from "@/components/ui/MetricItem";
import { ExpandableTabs, Tab } from "@/components/ui/expandable-tabs";
import { ProposalForm } from "@/components/ui/ProposalForm";
import {
  Copy,
  Eye,
  Send,
  Timer,
  DiamondPlus,
  Save,
  Settings,
  FileText,
  Clock,
  Users,
  PieChart,
  Mail,
} from "lucide-react";
import { saveProposal, ProposalSection } from "@/utils/openaiProposal";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Sample data for tables
const designItems = Array(7).fill({
  item: "Item Name",
  description: "Here is a summary of this item",
  hours: "15",
  price: "$2500",
});

const developmentItems = Array(5).fill({
  item: "Item Name",
  description: "Here is a summary of this item",
  hours: "15",
  price: "$2500",
});

export const MainContent: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [activeHeaderTab, setActiveHeaderTab] = useState<number | null>(null);
  const [generatedProposalSections, setGeneratedProposalSections] = useState<ProposalSection[]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleHeaderTabChange = (index: number | null) => {
    setActiveHeaderTab(index);
  };

  const handleProposalData = (sections: ProposalSection[], description: string, type: string, rate: number) => {
    setGeneratedProposalSections(sections);
    setProjectDescription(description);
    setProjectType(type);
    setHourlyRate(rate);
  };

  const handleSaveProposal = async () => {
    try {
      // Check if user is logged in
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to save proposals",
          variant: "destructive",
        });
        return;
      }

      // Check if we have proposal data to save
      if (generatedProposalSections.length === 0) {
        toast({
          title: "No proposal to save",
          description: "Please generate a proposal first",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);

      const result = await saveProposal({
        title: `Proposal for ${projectType} project`,
        projectDescription: projectDescription,
        projectType: projectType,
        hourlyRate: hourlyRate,
        sections: generatedProposalSections,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Proposal saved successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save proposal",
          variant: "destructive",
        });
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
      setActiveHeaderTab(null);
    }
  };

  const headerTabs: Tab[] = [
    { 
      title: "Add Section", 
      icon: DiamondPlus,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Add New Section</h2>
          <p>Here you can add a new section to your proposal.</p>
        </div>
      )
    },
    { 
      title: "Toggle Hours", 
      icon: Timer,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Hours Display Settings</h2>
          <p>Configure how hours are displayed in your proposal.</p>
        </div>
      )
    },
    { 
      title: "Preview", 
      icon: Eye,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Proposal Preview</h2>
          <p>Preview how your proposal will appear to clients.</p>
        </div>
      )
    },
    { 
      title: "Send", 
      icon: Send,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Send Proposal</h2>
          <p>Send this proposal to your client via email or generate a shareable link.</p>
        </div>
      )
    },
    { 
      title: "Copy", 
      icon: Copy,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Copy Proposal</h2>
          <p>Create a duplicate of this proposal as a starting point for a new one.</p>
        </div>
      )
    },
    { 
      title: "Save Proposal", 
      icon: Save,
      content: (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Save Proposal</h2>
          <p className="mb-4">Save your current proposal to your account.</p>
          <button 
            onClick={handleSaveProposal} 
            disabled={isSaving}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Proposal'} <Save size={16} />
          </button>
        </div>
      )
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <ProposalForm onProposalGenerated={handleProposalData} />
            {generatedProposalSections.length > 0 ? (
              generatedProposalSections.map((section, index) => (
                <TableSection 
                  key={index}
                  title={section.title} 
                  items={section.items} 
                  subtotal={section.subtotal} 
                />
              ))
            ) : (
              <>
                <TableSection title="design" items={designItems} subtotal="$25,000" />
                <TableSection title="development" items={developmentItems} subtotal="$25,000" />
              </>
            )}
          </>
        );
      case 1:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Revisions</h2>
            <p>Track and manage revisions to your proposal here.</p>
          </div>
        );
      case 2:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Metrics</h2>
            <p>View detailed metrics about your proposal performance.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="grow flex flex-col max-md:h-screen">
      <header className="h-[69px] flex justify-between items-center px-[23px] py-[15px] border-b-black border-b border-solid">
        <h1 className="text-black text-[26px] font-bold max-sm:text-xl">
          proposal 1.0
        </h1>

        <div className="flex items-center">
          <ExpandableTabs 
            tabs={headerTabs}
            className="border-gray-200"
            onChange={handleHeaderTabChange}
            showTabContent={activeHeaderTab !== null}
          />
        </div>
      </header>

      <nav className="flex gap-[34px] px-[23px] py-[15px]">
        <NavTab active={activeTab === 0} onClick={() => handleTabClick(0)}>
          download
        </NavTab>

        <NavTab active={activeTab === 1} onClick={() => handleTabClick(1)}>
          Revisions
        </NavTab>

        <NavTab active={activeTab === 2} onClick={() => handleTabClick(2)}>
          Metrics
        </NavTab>
      </nav>

      <div className="grow overflow-y-auto px-[23px] py-[15px]">
        {renderTabContent()}
      </div>

      <footer className="flex justify-between bg-[#F7F6F2] px-[17px] py-[15px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
        <MetricItem value="165" label="Total Hours" />
        <MetricItem value="2.6" label="Hours/Day" />
        <MetricItem value="$5,500" label="Monthly Revenue" />
        <MetricItem value="45%" label="Profit Margin" />
        <MetricItem value="$15,000" label="Total Value" />
      </footer>
    </main>
  );
};
