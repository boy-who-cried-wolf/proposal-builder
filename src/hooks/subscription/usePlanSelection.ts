
import { useState } from "react";
import { toast } from "sonner";
import { createCheckoutSession } from "@/services/stripeService";

export function usePlanSelection(userId: string | undefined, currentPlan: string) {
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) {
      toast.info("You are already on this plan");
      return;
    }
    
    if (!userId) {
      toast.error("You must be logged in to change your plan");
      return;
    }
    
    console.log(`Selecting plan: ${planId} for user: ${userId}`);
    setError(null);
    
    try {
      setCheckoutLoading(planId);
      toast.info(`Preparing checkout for ${planId} plan...`);
      const result = await createCheckoutSession(userId, planId);
      
      if (!result) {
        // The error has already been shown via toast in the service
        console.log("Checkout failed or was cancelled");
      }
    } catch (error) {
      console.error("Error selecting plan:", error);
      setError("There was a problem connecting to our payment processor. Please try again later.");
      setErrorDetails(JSON.stringify(error, null, 2));
      setShowErrorDialog(true);
    } finally {
      setCheckoutLoading("");
    }
  };

  return {
    checkoutLoading,
    error,
    errorDetails,
    showErrorDialog,
    setShowErrorDialog,
    handlePlanSelect
  };
}
