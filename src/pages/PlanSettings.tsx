import React from "react";
import { MainContent } from "@/components/layout/MainContent";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PlanSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = React.useState("free");

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

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) {
      return;
    }
    
    toast.info(`Subscription management is not implemented in this demo`);
    // In a real app, we would handle subscription changes here
  };

  return (
    <MainContent>
      <div className="border-b border-border pb-2 mb-6">
        <div className="container px-4 py-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account Settings</h1>
        </div>
      </div>
      
      <div className="container px-4">
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account" onClick={() => navigate("/account-settings")}>Account</TabsTrigger>
            <TabsTrigger value="organization" onClick={() => navigate("/account-settings/organization")}>Organization</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Subscription Plan</h2>
                <p className="text-muted-foreground">Choose the plan that's right for you</p>
              </div>
              
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
                          disabled={plan.disabled || currentPlan === plan.id}
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {currentPlan === plan.id ? "Current Plan" : "Select Plan"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground mt-8">
                <p>Need a custom plan for your business? <a href="#" className="text-primary underline">Contact us</a> for enterprise pricing.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainContent>
  );
};

export default PlanSettings;
