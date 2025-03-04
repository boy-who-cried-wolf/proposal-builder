
import { useAuth } from "@/contexts/AuthContext";
import { getOrganizationByUserId } from "@/integrations/supabase/organizationService";
import { Organization } from "@/types/organization.type";
import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export function useProposalFormState(
  propsProjectDescription?: string,
  propsProjectType?: string,
  propsHourlyRate?: number,
  propsFreelancerRate?: number,
  propsProjectBudget?: number,
  propsDateRange?: { from: Date; to?: Date },
  propsServices?: Array<string>,
) {

  console.log(
    propsProjectDescription,
    propsProjectType,
    propsHourlyRate,
    propsFreelancerRate,
    propsProjectBudget,
    propsDateRange,
    propsServices,
  )

  const { user } = useAuth();

  const [organization, setOrganization] = useState<Organization>()
  const [projectDescription, setProjectDescription] = useState(propsProjectDescription ?? "");
  const [hourlyRate, setHourlyRate] = useState(propsHourlyRate ?? 100);
  const [freelancerRate, setFreelancerRate] = useState(propsFreelancerRate ?? 60);
  const [projectBudget, setProjectBudget] = useState(propsProjectBudget ?? 5000);
  const [projectType, setProjectType] = useState(propsProjectType ?? "Website");
  const [services, setServices] = useState<Array<string>>(propsServices ?? []);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesOptions, setServicesOptions] = useState<Array<string>>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(propsDateRange ?? {
    from: new Date(),
    to: addDays(new Date(), 14),
  });

  const loadOrganization = async () => {
    setLoadingServices(true);
    const resOrg: Organization = await getOrganizationByUserId(user.id);

    setOrganization(resOrg);

    setServices(propsServices ?? resOrg.services);
    setHourlyRate(propsHourlyRate ?? resOrg.hourly_rate);
    // setFreelancerRate(resOrg.client_rate);

    setServicesOptions(resOrg.services);

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
