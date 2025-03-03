
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServicesSection } from "./ServicesSection";
import { RatesSection } from "./RatesSection";
import { KnowledgeBaseSection } from "./KnowledgeBaseSection";
import { Loader2 } from "lucide-react";

interface OrganizationSettingsFormProps {
  loading: boolean;
  saving: boolean;
  companyName: string;
  setCompanyName: (value: string) => void;
  hourlyRate: number | null;
  setHourlyRate: React.Dispatch<React.SetStateAction<number | null>>;
  clientRate: number | null;
  setClientRate: React.Dispatch<React.SetStateAction<number | null>>;
  knowledgeBase: string;
  setKnowledgeBase: (value: string) => void;
  services: string[];
  newService: string;
  setNewService: (value: string) => void;
  handleSave: () => void;
  handleAddService: () => void;
  handleRemoveService: (service: string) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number | null>>) => void;
  handleNumberFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const OrganizationSettingsForm: React.FC<OrganizationSettingsFormProps> = ({
  loading,
  saving,
  companyName,
  setCompanyName,
  hourlyRate,
  setHourlyRate,
  clientRate,
  setClientRate,
  knowledgeBase,
  setKnowledgeBase,
  services,
  newService,
  setNewService,
  handleSave,
  handleAddService,
  handleRemoveService,
  handleNumberChange,
  handleNumberFocus
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading organization settings...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <Input 
          value={companyName} 
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your company name" 
        />
      </div>
      
      <ServicesSection 
        services={services}
        newService={newService}
        setNewService={setNewService}
        handleAddService={handleAddService}
        handleRemoveService={handleRemoveService}
      />
      
      <RatesSection 
        hourlyRate={hourlyRate}
        clientRate={clientRate}
        handleNumberChange={handleNumberChange}
        handleNumberFocus={handleNumberFocus}
        setHourlyRate={setHourlyRate}
        setClientRate={setClientRate}
      />
      
      <KnowledgeBaseSection 
        knowledgeBase={knowledgeBase}
        setKnowledgeBase={setKnowledgeBase}
      />
      
      <div className="pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
