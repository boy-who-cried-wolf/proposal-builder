
import React from "react";
import { MetricItem } from "@/components/ui/MetricItem";

interface ProposalFooterProps {
  totalHours: string;
  hoursPerDay: string;
  totalValue: string;
}

export const ProposalFooter: React.FC<ProposalFooterProps> = ({
  totalHours,
  hoursPerDay,
  totalValue
}) => {
  return (
    <footer className="flex justify-between bg-[#F7F6F2] px-[17px] py-[15px] border-t-black border-t border-solid max-sm:flex-col max-sm:gap-5">
      <MetricItem value={totalHours} label="Total Hours" />
      <MetricItem value={hoursPerDay} label="Hours/Day" />
      <MetricItem value="$5,500" label="Monthly Revenue" />
      <MetricItem value="45%" label="Profit Margin" />
      <MetricItem value={totalValue} label="Total Value" />
    </footer>
  );
};
