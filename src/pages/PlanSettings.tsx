
import React, { useEffect } from "react";
import { MainContent } from "@/components/layout/MainContent";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { NavTab } from "@/components/ui/NavItem";
import { getCurrentSubscription, createCheckoutSession } from "@/services/stripeService";

const PlanSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPlan, setCurrentPlan] = React.useState("free");
  const [loading, setLoading] = React.useState(true);
  const [checkoutLoading, setCheckoutLoading] = React.useState("");
  
  // Check for query parameters
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success) {
      toast.success("Subscription updated successfully!");
      // Remove query parameters
      navigate('/account-settings/plan', { replace: true });
    } else if (canceled) {
      toast.info("Subscription update was canceled.");
      // Remove query parameters
      navigate('/account-settings/plan', { replace: true });
    }
  }, [success, canceled, navigate]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const subscription = await getCurrentSubscription(user.id);
          if (subscription && subscription.plan_id) {
            setCurrentPlan(subscription.plan_id);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [user]);

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

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan) {
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to change your plan");
      return;
    }
    
    try {
      setCheckoutLoading(planId);
      await createCheckoutSession(user.id, planId);
    } catch (error) {
      console.error("Error selecting plan:", error);
    } finally {
      setCheckoutLoading("");
    }
  };

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
            <div>
              <h2 className="text-xl font-semibold">Subscription Plan</h2>
              <p className="text-muted-foreground">Choose the plan that's right for you</p>
            </div>
            
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
      </MainContent>
    </div>
  );
};

export default PlanSettings;
