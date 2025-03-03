
import React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  disabled: boolean;
}

interface PlanCardProps {
  plan: PlanFeature;
  currentPlan: string;
  checkoutLoading: string;
  onSelectPlan: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlan,
  checkoutLoading,
  onSelectPlan,
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  const isLoading = checkoutLoading === plan.id;

  return (
    <div 
      className={`border rounded-lg p-6 ${
        plan.highlighted ? 'border-primary shadow-sm' : ''
      } ${isCurrentPlan ? 'bg-muted/50 border-primary' : ''}`}
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
            variant={isCurrentPlan ? "secondary" : "default"}
            className="w-full"
            disabled={plan.disabled || isCurrentPlan || checkoutLoading !== ""}
            onClick={() => onSelectPlan(plan.id)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isCurrentPlan ? (
              "Current Plan"
            ) : (
              "Select Plan"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
