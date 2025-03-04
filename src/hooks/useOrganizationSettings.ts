
import { useState, useEffect } from "react";
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
import { toast } from "sonner";

export const useOrganizationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [clientRate, setClientRate] = useState<number | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(false)

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
          setHourlyRate(org.hourly_rate || null);
          setClientRate(org.client_rate || null);
          setKnowledgeBase(org.knowledge_base || "");
          setServices(org.services || []);
        } else {
          // Use profile data as fallback
          setCompanyName(profile.company_name || "");
          setHourlyRate(profile.hourly_rate || null);
          setClientRate(profile.client_rate || null);
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
        const newOrg = await createOrganization(companyName, user.id);
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
        setLoadingServices(true);
        const newServices = await addServiceToProfile(user.id, newService.trim());
        setServices(newServices?.[0]?.services ?? []);
        setLoadingServices(false);
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
        setLoadingServices(true);
        const newServices = await removeServiceFromProfile(user.id, service);
        setServices(newServices?.[0]?.services ?? []);
        setLoadingServices(false);
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

  // Handle input change for number fields to prevent starting with 0
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number | null>>) => {
    const value = e.target.value;

    // If the input is empty, set to null
    if (!value) {
      setter(null);
      return;
    }

    // Remove leading zeros
    if (value.startsWith('0') && value.length > 1) {
      setter(parseInt(value.replace(/^0+/, ''), 10));
      return;
    }

    setter(parseInt(value, 10));
  };

  // Handle focus on number inputs to clear placeholder
  const handleNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  return {
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
    loadingServices,
    services,
    newService,
    setNewService,
    handleSave,
    handleAddService,
    handleRemoveService,
    handleNumberChange,
    handleNumberFocus
  };
};
