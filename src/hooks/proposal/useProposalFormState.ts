
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationByUserId } from "@/integrations/supabase/organizationService";
import { Organization } from "@/types/organization.type";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export function useProposalFormState() {
  const { user } = useAuth();

  const [organization, setOrganization] = useState<Organization>()
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [freelancerRate, setFreelancerRate] = useState(60);
  const [projectBudget, setProjectBudget] = useState(5000);
  const [projectType, setProjectType] = useState("Website");
  const [loadingServices, setLoadingServices] = useState(false);
  const [services, setServices] = useState<Array<string>>([]);
  const [servicesOptions, setServicesOptions] = useState<Array<string>>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const loadOrganization = async () => {
    setLoadingServices(true);
    const resOrg: Organization = await getOrganizationByUserId(user.id);

    setOrganization(resOrg);

    setServices(resOrg.services);
    setServicesOptions(resOrg.services);
    setHourlyRate(resOrg.hourly_rate);
    setFreelancerRate(resOrg.client_rate);

    setLoadingServices(false);
  }

  useEffect(() => {
    if (user.id) {
      loadOrganization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  return {
    projectDescription,
    setProjectDescription,
    hourlyRate,
    setHourlyRate,
    freelancerRate,
    setFreelancerRate,
    projectBudget,
    setProjectBudget,
    projectType,
    setProjectType,
    dateRange,
    setDateRange,
    services,
    setServices,
    loadingServices,
    servicesOptions
  };
}
