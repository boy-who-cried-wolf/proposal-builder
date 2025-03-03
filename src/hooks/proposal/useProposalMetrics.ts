
import { ProposalSection } from "@/types/proposal";
import {
  calculateTotalHours,
  calculateTotalWorkingDays,
  calculateHoursPerDay,
  calculateTotalValue,
  calculateMonthlyRevenue,
  calculateProfitMargin
} from "@/utils/proposal/calculations";

export function useProposalMetrics(
  sections: ProposalSection[],
  hourlyRate: number,
  freelancerRate: number = 0,
  dateRange?: { from: Date; to?: Date }
) {
  const getTotalHoursDisplay = (): string => {
    return calculateTotalHours(sections).toFixed(1);
  };

  const getHoursPerDayDisplay = (): string => {
    const totalHours = calculateTotalHours(sections);
    const workingDays = calculateTotalWorkingDays(dateRange);
    return calculateHoursPerDay(totalHours, workingDays).toFixed(1);
  };

  const getHoursPerDayValue = (): number => {
    const totalHours = calculateTotalHours(sections);
    const workingDays = calculateTotalWorkingDays(dateRange);
    return calculateHoursPerDay(totalHours, workingDays);
  };

  const getTotalValueDisplay = (): string => {
    const total = calculateTotalValue(sections);
    return `$${total.toLocaleString()}`;
  };

  const getMonthlyRevenueDisplay = (): string => {
    const totalValue = calculateTotalValue(sections);
    const workingDays = calculateTotalWorkingDays(dateRange);
    return calculateMonthlyRevenue(totalValue, workingDays);
  };

  const getProfitMargin = (): { display: string; value: number } => {
    return calculateProfitMargin(hourlyRate, freelancerRate);
  };

  return {
    getTotalHoursDisplay,
    getHoursPerDayDisplay,
    getHoursPerDayValue,
    getTotalValueDisplay,
    getMonthlyRevenueDisplay,
    getProfitMargin
  };
}
