
import { useState } from "react";
import { useSubscriptionData } from "./subscription/useSubscriptionData";
import { usePlanSelection } from "./subscription/usePlanSelection";
import { useSubscriptionManagement } from "./subscription/useSubscriptionManagement";

export function usePlanSubscription(userId: string | undefined) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  
  // Get subscription data
  const {
    currentPlan,
    loading,
    subscriptionInfo,
    error: dataError,
    errorDetails: dataErrorDetails,
    refreshing,
    userEmail,
    fetchSubscription,
    handleRefresh
  } = useSubscriptionData(userId);

  // Plan selection and checkout
  const {
    checkoutLoading,
    error: selectionError,
    errorDetails: selectionErrorDetails,
    showErrorDialog: selectionShowErrorDialog,
    setShowErrorDialog: selectionSetShowErrorDialog,
    handlePlanSelect
  } = usePlanSelection(userId, currentPlan);

  // Subscription management
  const {
    cancelLoading,
    portalLoading,
    error: managementError,
    errorDetails: managementErrorDetails,
    showErrorDialog: managementShowErrorDialog,
    setShowErrorDialog: managementSetShowErrorDialog,
    handleCancelSubscription,
    handleManageSubscription
  } = useSubscriptionManagement(userId, currentPlan, userEmail);

  // Combine errors from all sources
  const error = dataError || selectionError || managementError;
  const errorDetails = dataErrorDetails || selectionErrorDetails || managementErrorDetails;

  // Update the shared error dialog state when any of the individual ones change
  useState(() => {
    if (selectionShowErrorDialog || managementShowErrorDialog) {
      setShowErrorDialog(true);
    }
  });

  // Sync the shared dialog state back to the individual ones
  const handleSetShowErrorDialog = (show: boolean) => {
    setShowErrorDialog(show);
    selectionSetShowErrorDialog(show);
    managementSetShowErrorDialog(show);
  };

  return {
    // Subscription data
    currentPlan,
    loading,
    subscriptionInfo,
    refreshing,
    
    // Plan selection
    checkoutLoading,
    
    // Subscription management
    cancelLoading,
    portalLoading,
    
    // Error handling
    error,
    errorDetails,
    showErrorDialog,
    setShowErrorDialog: handleSetShowErrorDialog,
    
    // Actions
    fetchSubscription,
    handleRefresh,
    handlePlanSelect,
    handleCancelSubscription,
    handleManageSubscription
  };
}
