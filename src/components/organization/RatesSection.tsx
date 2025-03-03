
import React from "react";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // Calculate profit margin if both rates are available
  const profitMargin = React.useMemo(() => {
    if (hourlyRate && clientRate && hourlyRate > 0) {
      const margin = ((clientRate - hourlyRate) / clientRate) * 100;
      return margin.toFixed(1);
    }
    return null;
  }, [hourlyRate, clientRate]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Rates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium">Your Hourly Rate ($)</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">The rate you pay yourself or your team members per hour</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input 
            type="number" 
            value={hourlyRate === null ? "" : hourlyRate} 
            onChange={(e) => handleNumberChange(e, setHourlyRate)}
            onFocus={handleNumberFocus}
            min={1} 
            placeholder="Enter hourly rate"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium">Client Hourly Rate ($)</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">The rate you charge clients per hour</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
      
      {profitMargin && (
        <div className="bg-muted/50 p-3 rounded-md text-sm">
          <p>
            With these rates, your profit margin is approximately <span className="font-medium">{profitMargin}%</span>
          </p>
        </div>
      )}
    </div>
  );
};
