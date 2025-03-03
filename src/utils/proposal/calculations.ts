
import { ProposalSection } from "@/types/proposal";
import { differenceInBusinessDays } from "date-fns";

export const calculateTotalHours = (sections: ProposalSection[]): number => {
  let total = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const hours = parseFloat(item.hours.toString());
      if (!isNaN(hours)) {
        total += hours;
      }
    });
  });
  return Math.round(total * 10) / 10;
};

export const calculateTotalWorkingDays = (
  dateRange?: { from: Date; to?: Date }
): number => {
  if (!dateRange?.from || !dateRange?.to) {
    return 0;
  }
  return differenceInBusinessDays(dateRange.to, dateRange.from) + 1;
};

export const calculateHoursPerDay = (
  totalHours: number,
  workingDays: number
): number => {
  return workingDays > 0 ? Math.round((totalHours / workingDays) * 10) / 10 : 0;
};

export const calculateTotalValue = (sections: ProposalSection[]): number => {
  let total = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        total += price;
      }
    });
  });
  return Math.round(total);
};

export const calculateMonthlyRevenue = (
  totalValue: number,
  workingDays: number
): string => {
  if (workingDays <= 0) {
    return "$0";
  }
  
  const monthlyWorkingDays = 22;
  const monthlyRevenue = totalValue * (monthlyWorkingDays / workingDays);
  
  return `$${Math.round(monthlyRevenue).toLocaleString()}`;
};

export const calculateProfitMargin = (
  hourlyRate: number,
  freelancerRate: number
): { display: string; value: number } => {
  if (freelancerRate <= 0 || hourlyRate <= 0) {
    return { display: "0%", value: 0 };
  }

  const profitPerHour = hourlyRate - freelancerRate;
  const profitMarginPercent = (profitPerHour / hourlyRate) * 100;
  
  return { 
    display: `${Math.round(profitMarginPercent)}%`,
    value: Math.round(profitMarginPercent)
  };
};

export const calculateTotalFromSections = (sections: ProposalSection[]): number => {
  let total = 0;
  sections.forEach(section => {
    section.items.forEach(item => {
      const price = parseFloat(item.price.toString().replace(/[^0-9.-]+/g, ''));
      if (!isNaN(price)) {
        total += price;
      }
    });
  });
  return total;
};
