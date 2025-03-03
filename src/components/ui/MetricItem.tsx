import React from "react";
import { cn } from "@/lib/utils";

interface MetricItemProps {
  value: string;
  label: string;
  className?: string;
}

export const MetricItem: React.FC<MetricItemProps> = ({
  value,
  label,
  className,
}) => {
  return (
    <div
      className={cn(
        "text-left px-[5px] py-[15px] max-sm:text-center",
        className,
      )}
    >
      <div className="text-black text-lg font-bold tracking-[2.744px] uppercase mb-[5px]">
        {value}
      </div>
      <div className="text-black text-[9px] font-semibold tracking-[1.389px] uppercase">
        {label}
      </div>
    </div>
  );
};
