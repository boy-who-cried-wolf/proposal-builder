
import React, { useEffect, useState } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { NavTab } from "@/components/ui/NavItem";
import { getCurrentSubscription, createCheckoutSession, cancelSubscription } from "@/services/stripeService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PlanSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  
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

  const fetchSubscription = async () => {
    if (user?.id) {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching subscription for user ${user.id}`);
        const subscription = await getCurrentSubscription(user.id);
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

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscription();
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) {
      toast.info("You are already on this plan");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to change your plan");
      return;
    }
    
    console.log(`Selecting plan: ${planId} for user: ${user.id}`);
    setError(null);
    
    try {
      setCheckoutLoading(planId);
      toast.info(`Preparing checkout for ${planId} plan...`);
      const result = await createCheckoutSession(user.id, planId);
      
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
    if (!user?.id) {
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
      await cancelSubscription(user.id);
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

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Get started with the basics",
      features: [
        "3 proposals per month",
        "Export to Figma",
        "Basic templates"
      ],
      disabled: false
    },
    {
      id: "freelancer",
      name: "Freelancer",
      price: "$19",
      period: "per month",
      description: "Perfect for independent professionals",
      features: [
        "5 proposals per month",
        "Export to Figma",
        "Custom templates",
        "Client management",
        "Proposal analytics"
      ],
      disabled: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For growing agencies and teams",
      features: [
        "Unlimited proposals",
        "AI Assistant",
        "Export to Figma",
        "Custom templates",
        "Client management",
        "Proposal analytics",
        "Priority support",
        "Early access to new features"
      ],
      highlighted: true,
      disabled: false
    }
  ];

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
            
            {error && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive/80 p-0 h-auto mt-1"
                    onClick={() => setShowErrorDialog(true)}
                  >
                    View details
                  </Button>
                </div>
              </div>
            )}
            
            {subscriptionInfo && subscriptionInfo.status === "active" && currentPlan !== "free" && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Subscription</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionInfo.current_period_end ? (
                        <>Your plan renews on {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}</>
                      ) : (
                        <>You are subscribed to the {currentPlan} plan</>
                      )}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-2 sm:mt-0" 
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`border rounded-lg p-6 ${
                      plan.highlighted ? 'border-primary shadow-sm' : ''
                    } ${currentPlan === plan.id ? 'bg-muted/50 border-primary' : ''}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          {plan.period && (
                            <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-4">
                        <Button
                          variant={currentPlan === plan.id ? "secondary" : "default"}
                          className="w-full"
                          disabled={plan.disabled || currentPlan === plan.id || checkoutLoading !== ""}
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {checkoutLoading === plan.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : currentPlan === plan.id ? (
                            "Current Plan"
                          ) : (
                            "Select Plan"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mt-8">
              <p>Need a custom plan for your business? <a href="#" className="text-primary underline">Contact us</a> for enterprise pricing.</p>
            </div>
          </div>
        </div>
        
        {/* Error Details Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
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
              <Button variant="outline" onClick={() => setShowErrorDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainContent>
    </div>
  );
};

export default PlanSettings;
