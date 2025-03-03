
import { useState } from "react";
import { toast } from "sonner";
import { cancelSubscription, createCustomerPortalSession } from "@/services/stripeService";
import { updateUserInLoops } from "@/utils/loopsIntegration";

export function useSubscriptionManagement(userId: string | undefined, currentPlan: string, userEmail: string | null) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleCancelSubscription = async () => {
    if (!userId) {
      toast.error("You must be logged in to cancel your subscription");
      return;
    }
    
    if (currentPlan === "free") {
      toast.info("You are already on the free plan");
      return;
    }
    
    try {
      setCancelLoading(true);
      setError(null);
      await cancelSubscription(userId);
      
      // Update Loops contact when subscription is cancelled
      if (userEmail) {
        try {
          await updateUserInLoops(userEmail, 'free');
          console.log("User downgraded to free plan in Loops:", userEmail);
        } catch (loopsError) {
          console.error("Error updating Loops contact:", loopsError);
          // Continue anyway as this is not critical
        }
      }
      
      toast.success("Your subscription has been cancelled");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setError("Unable to cancel your subscription. Please try again later.");
      setErrorDetails(JSON.stringify(error, null, 2));
      setShowErrorDialog(true);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!userId) {
      toast.error("You must be logged in to manage your subscription");
      return;
    }
    
    if (currentPlan === "free") {
      toast.info("You are on the free plan with no active subscription to manage");
      return;
    }
    
    try {
      setPortalLoading(true);
      setError(null);
      await createCustomerPortalSession(userId);
      // No need to fetch subscription here as we're redirecting to Stripe portal
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      setError("Unable to access the subscription management portal. Please try again later.");
      setErrorDetails(JSON.stringify(error, null, 2));
      setShowErrorDialog(true);
      setPortalLoading(false);
    }
  };

  return {
    cancelLoading,
    portalLoading,
    error,
    errorDetails,
    showErrorDialog,
    setShowErrorDialog,
    handleCancelSubscription,
    handleManageSubscription
  };
}
