
import React from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { NavTab } from "@/components/ui/NavItem";
import { OrganizationSettingsForm } from "@/components/organization/OrganizationSettingsForm";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";

const OrganizationSettings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
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
  } = useOrganizationSettings();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent>
        <div className="border-b border-border pb-4">
          <div className="container">
            <h1 className="text-3xl font-bold py-4">Account Settings</h1>
          </div>
        </div>
        
        <div className="container px-4">
          <div className="flex gap-[34px] px-[23px] py-[15px] mb-4">
            <NavTab 
              active={location.pathname === "/account-settings"} 
              onClick={() => navigate("/account-settings")}
            >
              Account
            </NavTab>
            <NavTab 
              active={location.pathname === "/account-settings/organization"} 
              onClick={() => navigate("/account-settings/organization")}
            >
              Organization
            </NavTab>
            <NavTab 
              active={location.pathname === "/account-settings/plan"} 
              onClick={() => navigate("/account-settings/plan")}
            >
              Plan
            </NavTab>
          </div>
          
          <OrganizationSettingsForm
            loading={loading}
            saving={saving}
            companyName={companyName}
            setCompanyName={setCompanyName}
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            clientRate={clientRate}
            setClientRate={setClientRate}
            knowledgeBase={knowledgeBase}
            setKnowledgeBase={setKnowledgeBase}
            services={services}
            newService={newService}
            setNewService={setNewService}
            handleSave={handleSave}
            handleAddService={handleAddService}
            handleRemoveService={handleRemoveService}
            handleNumberChange={handleNumberChange}
            handleNumberFocus={handleNumberFocus}
          />
        </div>
      </MainContent>
    </div>
  );
};

export default OrganizationSettings;
