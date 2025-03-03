import React, { useState, useEffect } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, addServiceToProfile, removeServiceFromProfile } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const OrganizationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [clientRate, setClientRate] = useState<number>(0);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");

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
        setCompanyName(profile.company_name || "");
        setHourlyRate(profile.hourly_rate || 100);
        setClientRate(profile.client_rate || 75);
        setKnowledgeBase(profile.knowledge_base || "");
        setServices(profile.services || []);
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
      await updateUserProfile(user.id, {
        company_name: companyName,
        hourly_rate: hourlyRate,
        client_rate: clientRate,
        knowledge_base: knowledgeBase,
        // Services are handled separately
      });
      
      toast.success("Organization settings saved successfully");
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
      await addServiceToProfile(user.id, newService.trim());
      setServices([...services, newService.trim()]);
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
      await removeServiceFromProfile(user.id, service);
      setServices(services.filter(s => s !== service));
      toast.success("Service removed successfully");
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Failed to remove service");
    }
  };

  return (
    <MainContent>
      <div className="border-b border-border pb-2 mb-6">
        <div className="container px-4 py-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>
      </div>
      
      <div className="container px-4">
        <Tabs defaultValue="organization" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account" onClick={() => navigate("/account-settings")}>Account</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="plan" onClick={() => navigate("/account-settings/plan")}>Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organization" className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading organization settings...</div>
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
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainContent>
  );
};

export default OrganizationSettings;
