
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface AuthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToAuth: () => void;
}

export const AuthenticationDialog: React.FC<AuthenticationDialogProps> = ({
  open,
  onOpenChange,
  onGoToAuth
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            You need to sign in or create an account to generate proposals.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-3 mt-4">
          <p className="text-sm text-gray-500">
            Proposal generation is a premium feature that requires authentication.
            Your proposal details have been saved and will be generated immediately after you sign in.
          </p>
          <button
            onClick={onGoToAuth}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Sign In or Create Account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
