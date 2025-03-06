
import React from "react";
import { MetricItem } from "@/components/ui/MetricItem";
import { cn } from "@/lib/utils";
import { ProposalSection } from "@/types/proposal";
import { DateRange } from "react-day-picker";
import { differenceInBusinessDays } from "date-fns";

interface ProposalFooterProps {
  totalHours?: string;
  hoursPerDay?: string;
  totalValue?: string;
  monthlyRevenue?: string;
  profitMargin?: string;
  profitMarginValue?: number;
  hoursPerDayValue?: number;
  // Add the missing props
  proposalHistory?: ProposalSection[][];
  onRevertProposal?: (index: number) => void;
  // Add props for calculations
  sections?: ProposalSection[];
  dateRange?: DateRange;
  hourlyRate?: number;
  freelancerRate?: number;
}

export const ProposalFooter: React.FC<ProposalFooterProps> = ({
  totalHours,
  hoursPerDay,
  totalValue,
  monthlyRevenue,
  profitMargin,
  profitMarginValue = 0,
  hoursPerDayValue = 0,
  // New props 
  proposalHistory,
  onRevertProposal,
  // Props for calculations
  sections = [],
  dateRange,
  hourlyRate = 0,
  freelancerRate = 0
}) => {
  // Calculate metrics based on proposal data if available
  const calculatedMetrics = React.useMemo(() => {
    if (!sections || sections.length === 0) {
      return {
        totalHours: "0",
        hoursPerDay: "0",
        hoursPerDayValue: 0,
        totalValue: "$0",
        monthlyRevenue: "$0",
        profitMargin: "0%",
        profitMarginValue: 0
      };
    }

    // Calculate total hours
    let totalHoursValue = 0;
    let totalValueAmount = 0;

    sections.forEach(section => {
      section.items.forEach(item => {
        // Parse hours value (accepting string or number)
        const hours = typeof item.hours === 'string' 
          ? parseFloat(item.hours.replace(/[^0-9.]/g, '')) 
          : parseFloat(item.hours.toString());
        
        if (!isNaN(hours)) {
          totalHoursValue += hours;
        }

        // Parse price value (accepting string or number)
        const price = typeof item.price === 'string'
          ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
          : parseFloat(item.price.toString());
        
        if (!isNaN(price)) {
          totalValueAmount += price;
        }
      });
    });

    // Calculate business days if dateRange is provided
    let businessDays = 0;
    if (dateRange?.from && dateRange?.to) {
      businessDays = differenceInBusinessDays(dateRange.to, dateRange.from) + 1;
    }

    // Calculate hours per day
    const hoursPerDayValue = businessDays > 0 
      ? Math.round((totalHoursValue / businessDays) * 10) / 10 
      : 0;

    // Calculate monthly revenue
    const monthlyWorkingDays = 22; // Average working days in a month
    const monthlyRevenueValue = businessDays > 0 
      ? totalValueAmount * (monthlyWorkingDays / businessDays) 
      : 0;

    // Calculate profit margin
    let profitMarginValue = 0;
    if (hourlyRate > 0 && freelancerRate > 0) {
      profitMarginValue = Math.round(((hourlyRate - freelancerRate) / hourlyRate) * 100);
    }

    return {
      totalHours: totalHoursValue.toString(),
      hoursPerDay: hoursPerDayValue.toString(),
      hoursPerDayValue,
      totalValue: `$${Math.round(totalValueAmount).toLocaleString()}`,
      monthlyRevenue: `$${Math.round(monthlyRevenueValue).toLocaleString()}`,
      profitMargin: `${profitMarginValue}%`,
      profitMarginValue
    };
  }, [sections, dateRange, hourlyRate, freelancerRate]);

  // Use the calculated values or the ones passed as props
  const displayTotalHours = totalHours || calculatedMetrics.totalHours;
  const displayHoursPerDay = hoursPerDay || calculatedMetrics.hoursPerDay;
  const displayTotalValue = totalValue || calculatedMetrics.totalValue;
  const displayMonthlyRevenue = monthlyRevenue || calculatedMetrics.monthlyRevenue;
  const displayProfitMargin = profitMargin || calculatedMetrics.profitMargin;
  const displayProfitMarginValue = profitMarginValue || calculatedMetrics.profitMarginValue;
  const displayHoursPerDayValue = hoursPerDayValue || calculatedMetrics.hoursPerDayValue;

  // Get the appropriate color classes based on the values
  const getHoursPerDayColorClass = () => {
    if (displayHoursPerDayValue > 8) return "text-orange-600";
    if (displayHoursPerDayValue >= 6) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getProfitMarginColorClass = () => {
    if (displayProfitMarginValue >= 60) return "text-emerald-500";
    if (displayProfitMarginValue >= 30) return "text-yellow-500";
    return "text-orange-600";
  };

  return (
    <footer className="flex justify-between bg-white px-[17px] py-[11px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
      <MetricItem value={displayTotalHours} label="Total Hours" className="text-[#403E43]" />
      <MetricItem 
        value={displayHoursPerDay} 
        label="Hours/Day" 
        className={cn("text-[#403E43]", getHoursPerDayColorClass())}
      />
      <MetricItem value={displayMonthlyRevenue} label="Monthly Revenue" className="text-[#403E43]" />
      <MetricItem 
        value={displayProfitMargin} 
        label="Profit Margin" 
        className={cn("text-[#403E43]", getProfitMarginColorClass())}
      />
      <MetricItem value={displayTotalValue} label="Total Value" className="text-[#403E43]" />
    </footer>
  );
};
