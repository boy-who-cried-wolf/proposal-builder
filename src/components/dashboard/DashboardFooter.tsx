
import React from "react";
import { MetricItem } from "@/components/ui/MetricItem";

interface DashboardFooterProps {
  totalValue: number;
  totalHours: number;
  avgHourlyRate: number;
  projectCount: number;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({
  totalValue,
  totalHours,
  avgHourlyRate,
  projectCount
}) => {
  // Format currency and numbers
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalValue);
  
  const formattedHourlyRate = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(avgHourlyRate);

  return (
    <footer className="flex justify-between bg-white px-[17px] py-[15px] border-t-[#C8C8C9] border-t border-solid max-sm:flex-col max-sm:gap-5">
      <MetricItem value={projectCount.toString()} label="Projects" className="text-[#403E43]" />
      <MetricItem value={totalHours.toString()} label="Total Hours" className="text-[#403E43]" />
      <MetricItem value={formattedHourlyRate} label="Avg. Hourly Rate" className="text-[#403E43]" />
      <MetricItem value={formattedValue} label="Total Value" className="text-[#403E43]" />
    </footer>
  );
};
