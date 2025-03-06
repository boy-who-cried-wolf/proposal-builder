
import React from "react";
import { MetricItem } from "@/components/ui/MetricItem";
import { cn } from "@/lib/utils";
import { ProposalSection } from "@/types/proposal";

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
}

export const ProposalFooter: React.FC<ProposalFooterProps> = ({
  totalHours = "0",
  hoursPerDay = "0",
  totalValue = "$0",
  monthlyRevenue = "$0",
  profitMargin = "0%",
  profitMarginValue = 0,
  hoursPerDayValue = 0,
  // New props (not using them yet)
  proposalHistory,
  onRevertProposal
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
    <footer className="flex justify-between bg-white px-[17px] py-[11px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
      <MetricItem value={totalHours} label="Total Hours" className="text-[#403E43]" />
      <MetricItem 
        value={hoursPerDay} 
        label="Hours/Day" 
        className={cn("text-[#403E43]", getHoursPerDayColorClass())}
      />
      <MetricItem value={monthlyRevenue} label="Monthly Revenue" className="text-[#403E43]" />
      <MetricItem 
        value={profitMargin} 
        label="Profit Margin" 
        className={cn("text-[#403E43]", getProfitMarginColorClass())}
      />
      <MetricItem value={totalValue} label="Total Value" className="text-[#403E43]" />
    </footer>
  );
};
