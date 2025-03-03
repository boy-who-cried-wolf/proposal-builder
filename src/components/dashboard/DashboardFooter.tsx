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
    maximumFractionDigits: 1
  }).format(avgHourlyRate);

  // Calculate hours per day (pseudo calculation for demo)
  const hoursPerDay = (totalHours / 30).toFixed(1);

  // Calculate monthly revenue (pseudo calculation for demo)
  const monthlyRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalValue / 3);

  // Calculate profit margin (pseudo calculation for demo)
  const profitMargin = "45%";
  return <footer className="flex justify-between bg-white px-[17px] border-t border-[#C8C8C9] py-[13px]">
      <div className="text-left">
        <p className="text-3xl font-bold">{totalHours}</p>
        <p className="text-xs text-[#8E9196] uppercase font-medium">TOTAL HOURS</p>
      </div>
      
      <div className="text-left text-[#FF6A00]">
        <p className="text-3xl font-bold">{hoursPerDay}</p>
        <p className="text-xs text-[#8E9196] uppercase font-medium">HOURS/DAY</p>
      </div>
      
      <div className="text-left text-[#00C875]">
        <p className="text-3xl font-bold">{monthlyRevenue}</p>
        <p className="text-xs text-[#8E9196] uppercase font-medium">MONTHLY REVENUE</p>
      </div>
      
      <div className="text-left">
        <p className="text-3xl font-bold">{profitMargin}</p>
        <p className="text-xs text-[#8E9196] uppercase font-medium">PROFIT MARGIN</p>
      </div>
      
      <div className="text-left">
        <p className="text-3xl font-bold">{formattedValue}</p>
        <p className="text-xs text-[#8E9196] uppercase font-medium">TOTAL VALUE</p>
      </div>
    </footer>;
};