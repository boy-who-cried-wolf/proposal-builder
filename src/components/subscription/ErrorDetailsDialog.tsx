
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ErrorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorDetails: string;
}

export const ErrorDetailsDialog: React.FC<ErrorDetailsDialogProps> = ({
  open,
  onOpenChange,
  errorDetails,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error Details</DialogTitle>
          <DialogDescription>
            Technical information about the error.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-auto bg-muted p-4 rounded text-xs font-mono">
          <pre>{errorDetails || "No details available"}</pre>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
