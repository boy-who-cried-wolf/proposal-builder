import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PlanCard } from "./PlanCard";
import { getPlansWithPricing } from "@/services/stripeService";

// Define the base plans data structure
const defaultPlans = [
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

interface PlansGridProps {
  loading: boolean;
  currentPlan: string;
  checkoutLoading: string;
  onSelectPlan: (planId: string) => void;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  loading,
  currentPlan,
  checkoutLoading,
  onSelectPlan,
}) => {
  const [plans, setPlans] = useState(defaultPlans);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    const fetchPlansPricing = async () => {
      setLoadingPrices(true);
      try {
        const pricingData = await getPlansWithPricing();
        
        if (pricingData && pricingData.plans) {
          // Update plans with dynamic pricing from Stripe
          const updatedPlans = defaultPlans.map(plan => {
            const planPricing = pricingData.plans.find(p => p.id === plan.id);
            if (planPricing) {
              return {
                ...plan,
                price: planPricing.price,
                period: planPricing.period || plan.period
              };
            }
            return plan;
          });
          
          setPlans(updatedPlans);
        }
      } catch (error) {
        console.error("Error fetching plan pricing:", error);
        // Keep using default pricing if there's an error
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPlansPricing();
  }, []);

  if (loading || loadingPrices) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          currentPlan={currentPlan}
          checkoutLoading={checkoutLoading}
          onSelectPlan={onSelectPlan}
        />
      ))}
    </div>
  );
};
