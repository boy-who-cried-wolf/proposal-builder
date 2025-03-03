
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

interface CurrentSubscriptionProps {
  subscriptionInfo: any;
  currentPlan: string;
  cancelLoading: boolean;
  portalLoading: boolean;
  onCancel: () => void;
  onManageSubscription: () => void;
}

export const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({
  subscriptionInfo,
  currentPlan,
  cancelLoading,
  portalLoading,
  onCancel,
  onManageSubscription,
}) => {
  if (!subscriptionInfo || subscriptionInfo.status !== "active" || currentPlan === "free") {
    return null;
  }

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex flex-col space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={onManageSubscription}
              disabled={portalLoading || cancelLoading}
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={cancelLoading || portalLoading}
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
      </div>
    </div>
  );
};
