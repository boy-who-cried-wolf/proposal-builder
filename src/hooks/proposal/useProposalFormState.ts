
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

export function useProposalFormState() {
  const [projectDescription, setProjectDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [freelancerRate, setFreelancerRate] = useState(60);
  const [projectBudget, setProjectBudget] = useState(5000);
  const [projectType, setProjectType] = useState("Website");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 14),
  });

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
    setDateRange
  };
}
