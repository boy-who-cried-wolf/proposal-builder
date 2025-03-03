
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  error: string | null;
  onViewDetails: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onViewDetails }) => {
  if (!error) return null;

  return (
    <div className="bg-destructive/15 text-destructive p-4 rounded-lg flex items-start gap-3">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">{error}</p>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive/80 p-0 h-auto mt-1"
          onClick={onViewDetails}
        >
          View details
        </Button>
      </div>
    </div>
  );
};
