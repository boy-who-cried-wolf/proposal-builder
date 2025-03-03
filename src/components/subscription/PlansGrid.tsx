
import React from "react";
import { Loader2 } from "lucide-react";
import { PlanCard } from "./PlanCard";

// Define the plans data
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
  if (loading) {
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
