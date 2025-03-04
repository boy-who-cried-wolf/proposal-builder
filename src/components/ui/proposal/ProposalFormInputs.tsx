
import React from "react";
import { ProjectTypeSelect } from "../ProjectTypeSelect";
import { NumericInput } from "../NumericInput";
import { DateRangePicker } from "../DateRangePicker";
import { ProjectDescriptionTextarea } from "../ProjectDescriptionTextarea";
import { DateRange } from "react-day-picker";
import { Textarea } from "../textarea";
import { ServicesSelect } from "../ServicesSelect";

interface ProposalFormInputsProps {
  projectType: string;
  setProjectType: (type: string) => void;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  freelancerRate: number;
  setFreelancerRate: (rate: number) => void;
  projectBudget: number;
  setProjectBudget: (budget: number) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  services: Array<string>;
  setServices: (v: Array<string>) => void;
  loadingServices: boolean;
  servicesOptions: Array<string>;
}

export const ProposalFormInputs: React.FC<ProposalFormInputsProps> = ({
  projectType,
  setProjectType,
  hourlyRate,
  setHourlyRate,
  freelancerRate,
  setFreelancerRate,
  projectBudget,
  setProjectBudget,
  dateRange,
  setDateRange,
  projectDescription,
  setProjectDescription,
  services,
  setServices,
  loadingServices,
  servicesOptions,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <ServicesSelect
          services={services}
          setServices={setServices}
          loadingServices={loadingServices}
          servicesOptions={servicesOptions}
        />

        <ProjectTypeSelect
          projectType={projectType}
          setProjectType={setProjectType}
        />

        <NumericInput
          label="Hourly Rate ($)"
          value={hourlyRate}
          onChange={setHourlyRate}
        />

        <NumericInput
          label="Freelancer Rate ($)"
          value={freelancerRate}
          onChange={setFreelancerRate}
        />

        <NumericInput
          label="Project Budget ($)"
          value={projectBudget}
          onChange={setProjectBudget}
          min={100}
        />

        <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className="flex-grow mb-4">
        <ProjectDescriptionTextarea
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
        />
      </div>
    </div>
  );
};
