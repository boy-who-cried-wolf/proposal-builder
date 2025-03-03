
import React from "react";
import { Input } from "@/components/ui/input";

interface RatesSectionProps {
  hourlyRate: number | null;
  clientRate: number | null;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number | null>>) => void;
  handleNumberFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  setHourlyRate: React.Dispatch<React.SetStateAction<number | null>>;
  setClientRate: React.Dispatch<React.SetStateAction<number | null>>;
}

export const RatesSection: React.FC<RatesSectionProps> = ({
  hourlyRate,
  clientRate,
  handleNumberChange,
  handleNumberFocus,
  setHourlyRate,
  setClientRate
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Your Hourly Rate ($)</label>
        <Input 
          type="number" 
          value={hourlyRate === null ? "" : hourlyRate} 
          onChange={(e) => handleNumberChange(e, setHourlyRate)}
          onFocus={handleNumberFocus}
          min={1} 
          placeholder="Enter hourly rate"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Client Hourly Rate ($)</label>
        <Input 
          type="number" 
          value={clientRate === null ? "" : clientRate} 
          onChange={(e) => handleNumberChange(e, setClientRate)}
          onFocus={handleNumberFocus}
          min={1} 
          placeholder="Enter client rate"
        />
      </div>
    </div>
  );
};
