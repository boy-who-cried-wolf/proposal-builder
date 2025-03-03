
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CurrentSubscriptionProps {
  subscriptionInfo: any;
  currentPlan: string;
  cancelLoading: boolean;
  onCancel: () => void;
}

export const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({
  subscriptionInfo,
  currentPlan,
  cancelLoading,
  onCancel,
}) => {
  if (!subscriptionInfo || subscriptionInfo.status !== "active" || currentPlan === "free") {
    return null;
  }

  return (
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
          onClick={onCancel}
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
  );
};
