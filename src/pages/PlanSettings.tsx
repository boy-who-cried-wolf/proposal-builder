
import React, { useEffect } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { NavTab } from "@/components/ui/NavItem";
import { usePlanSubscription } from "@/hooks/usePlanSubscription";
import { ErrorDetailsDialog } from "@/components/subscription/ErrorDetailsDialog";
import { CurrentSubscription } from "@/components/subscription/CurrentSubscription";
import { ErrorMessage } from "@/components/subscription/ErrorMessage";
import { PlansGrid } from "@/components/subscription/PlansGrid";

const PlanSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    currentPlan,
    loading,
    checkoutLoading,
    cancelLoading,
    portalLoading,
    subscriptionInfo,
    error,
    errorDetails,
    refreshing,
    showErrorDialog,
    setShowErrorDialog,
    fetchSubscription,
    handleRefresh,
    handlePlanSelect,
    handleCancelSubscription,
    handleManageSubscription
  } = usePlanSubscription(user?.id);
  
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success) {
      toast.success("Subscription updated successfully!");
      navigate('/account-settings/plan', { replace: true });
    } else if (canceled) {
      toast.info("Subscription update was canceled.");
      navigate('/account-settings/plan', { replace: true });
    }
  }, [success, canceled, navigate]);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent>
        <div className="border-b border-border pb-4">
          <div className="container">
            <h1 className="text-3xl font-bold py-4">Account Settings</h1>
          </div>
        </div>
        
        <div className="container px-4">
          <div className="flex gap-[34px] px-[23px] py-[15px] mb-4">
            <NavTab 
              active={location.pathname === "/account-settings"} 
              onClick={() => navigate("/account-settings")}
            >
              Account
            </NavTab>
            <NavTab 
              active={location.pathname === "/account-settings/organization"} 
              onClick={() => navigate("/account-settings/organization")}
            >
              Organization
            </NavTab>
            <NavTab 
              active={location.pathname === "/account-settings/plan"} 
              onClick={() => navigate("/account-settings/plan")}
            >
              Plan
            </NavTab>
          </div>
            
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Subscription Plan</h2>
                <p className="text-muted-foreground">Choose the plan that's right for you</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh
              </Button>
            </div>
            
            <ErrorMessage 
              error={error} 
              onViewDetails={() => setShowErrorDialog(true)} 
            />
            
            <CurrentSubscription 
              subscriptionInfo={subscriptionInfo}
              currentPlan={currentPlan}
              cancelLoading={cancelLoading}
              portalLoading={portalLoading}
              onCancel={handleCancelSubscription}
              onManageSubscription={handleManageSubscription}
            />
            
            <PlansGrid 
              loading={loading}
              currentPlan={currentPlan}
              checkoutLoading={checkoutLoading}
              onSelectPlan={handlePlanSelect}
            />
            
            <div className="text-sm text-muted-foreground mt-8">
              <p>Need a custom plan for your business? <a href="#" className="text-primary underline">Contact us</a> for enterprise pricing.</p>
            </div>
          </div>
        </div>
        
        <ErrorDetailsDialog 
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          errorDetails={errorDetails}
        />
      </MainContent>
    </div>
  );
};

export default PlanSettings;
