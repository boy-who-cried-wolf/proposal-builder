
import React from "react";
import { MetricItem } from "@/components/ui/MetricItem";
import { cn } from "@/lib/utils";

interface ProposalFooterProps {
  totalHours: string;
  hoursPerDay: string;
  totalValue: string;
  monthlyRevenue: string;
  profitMargin: string;
  profitMarginValue: number;
  hoursPerDayValue: number;
}

export const ProposalFooter: React.FC<ProposalFooterProps> = ({
  totalHours,
  hoursPerDay,
  totalValue,
  monthlyRevenue,
  profitMargin,
  profitMarginValue,
  hoursPerDayValue
}) => {
  // Get the appropriate color classes based on the values
  const getHoursPerDayColorClass = () => {
    if (hoursPerDayValue > 8) return "text-orange-600";
    if (hoursPerDayValue >= 6) return "text-yellow-500";
    return "text-emerald-500";
  };

  const getProfitMarginColorClass = () => {
    if (profitMarginValue >= 60) return "text-emerald-500";
    if (profitMarginValue >= 30) return "text-yellow-500";
    return "text-orange-600";
  };

  return (
    <footer className="flex justify-between bg-[#F7F6F2] px-[17px] py-[15px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
      <MetricItem value={totalHours} label="Total Hours" />
      <MetricItem 
        value={hoursPerDay} 
        label="Hours/Day" 
        className={getHoursPerDayColorClass()}
      />
      <MetricItem value={monthlyRevenue} label="Monthly Revenue" />
      <MetricItem 
        value={profitMargin} 
        label="Profit Margin" 
        className={getProfitMarginColorClass()}
      />
      <MetricItem value={totalValue} label="Total Value" />
    </footer>
  );
};
