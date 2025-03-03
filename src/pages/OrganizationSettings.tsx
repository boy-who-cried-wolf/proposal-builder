
import React, { useState, useEffect } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getUserProfile
} from "@/integrations/supabase/profileService"; 
import {
  updateOrganization, 
  createOrganization
} from "@/integrations/supabase/organizationService";
import {
  linkUserToOrganization
} from "@/integrations/supabase/profileService";
import {
  addServiceToProfile, 
  removeServiceFromProfile 
} from "@/integrations/supabase/serviceManagement";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { NavTab } from "@/components/ui/NavItem";

const OrganizationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [clientRate, setClientRate] = useState<number>(0);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        // Check if user has an organization
        if (profile.organizations) {
          const org = profile.organizations;
          setOrganizationId(org.id);
          setCompanyName(org.name || "");
          setHourlyRate(org.hourly_rate || 100);
          setClientRate(org.client_rate || 75);
          setKnowledgeBase(org.knowledge_base || "");
          setServices(org.services || []);
        } else {
          // Use profile data as fallback
          setCompanyName(profile.company_name || "");
          setHourlyRate(profile.hourly_rate || 100);
          setClientRate(profile.client_rate || 75);
          setKnowledgeBase(profile.knowledge_base || "");
          setServices(profile.services || []);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      // If user doesn't have an organization yet, create one
      if (!organizationId) {
        toast.info("Creating new organization...");
        const newOrg = await createOrganization(companyName);
        setOrganizationId(newOrg.id);
        
        // Link user to the new organization
        await linkUserToOrganization(user.id, newOrg.id);
        
        // Update the organization with all settings
        await updateOrganization(newOrg.id, {
          name: companyName,
          hourly_rate: hourlyRate,
          client_rate: clientRate,
          knowledge_base: knowledgeBase,
          services: services
        });
        
        toast.success("Organization created and settings saved successfully");
      } else {
        // Update existing organization
        await updateOrganization(organizationId, {
          name: companyName,
          hourly_rate: hourlyRate,
          client_rate: clientRate,
          knowledge_base: knowledgeBase,
          services: services
        });
        
        toast.success("Organization settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving organization settings:", error);
      toast.error("Failed to save organization settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.trim() || !user?.id) return;
    
    try {
      // Only use the service management API if we have an organization
      if (organizationId) {
        await addServiceToProfile(user.id, newService.trim());
      } else {
        // Just update the local state if no organization exists yet
        setServices([...services, newService.trim()]);
      }
      setNewService("");
      toast.success("Service added successfully");
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const handleRemoveService = async (service: string) => {
    if (!user?.id) return;
    
    try {
      // Only use the service management API if we have an organization
      if (organizationId) {
        await removeServiceFromProfile(user.id, service);
      } else {
        // Just update the local state if no organization exists yet
        setServices(services.filter(s => s !== service));
      }
      toast.success("Service removed successfully");
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Failed to remove service");
    }
  };

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
          
          {loading ? (
            <div className="text-center py-8 flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" />
              <span>Loading organization settings...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <Input 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Services</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {services.length === 0 ? (
                      <div className="text-muted-foreground text-sm">No services added yet</div>
                    ) : (
                      services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {service}
                          <button 
                            onClick={() => handleRemoveService(service)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newService} 
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service" 
                    />
                    <Button onClick={handleAddService} size="sm" type="button">
                      <Plus size={16} className="mr-1" /> Add
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Hourly Rate ($)</label>
                    <Input 
                      type="number" 
                      value={hourlyRate} 
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      min={0} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Hourly Rate ($)</label>
                    <Input 
                      type="number" 
                      value={clientRate} 
                      onChange={(e) => setClientRate(Number(e.target.value))}
                      min={0} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Knowledge Base</label>
                  <p className="text-sm text-muted-foreground mb-2">
                    This information will be used to help the AI create better proposals for your business.
                  </p>
                  <Textarea 
                    value={knowledgeBase} 
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Enter information about your business, expertise, preferred working style, etc."
                    rows={6}
                  />
                </div>
                
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
            </>
          )}
        </div>
      </MainContent>
    </div>
  );
};

export default OrganizationSettings;
