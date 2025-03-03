
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getCurrentSubscription, createCheckoutSession, cancelSubscription } from "@/services/stripeService";

export function usePlanSubscription(userId: string | undefined) {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const fetchSubscription = async () => {
    if (userId) {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching subscription for user ${userId}`);
        const subscription = await getCurrentSubscription(userId);
        console.log("Received subscription data:", subscription);
        
        if (subscription && subscription.plan_id) {
          setCurrentPlan(subscription.plan_id);
          setSubscriptionInfo(subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setError("Unable to load your subscription information. Please try again.");
        setErrorDetails(JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscription();
  };

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
      await fetchSubscription();
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

  return {
    currentPlan,
    loading,
    checkoutLoading,
    cancelLoading,
    subscriptionInfo,
    error,
    errorDetails,
    refreshing,
    showErrorDialog,
    setShowErrorDialog,
    fetchSubscription,
    handleRefresh,
    handlePlanSelect,
    handleCancelSubscription
  };
}
