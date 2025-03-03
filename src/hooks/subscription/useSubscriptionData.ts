
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { getCurrentSubscription } from "@/services/stripeService";

export function useSubscriptionData(userId: string | undefined) {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email for Loops integration
  const fetchUserEmail = async () => {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error fetching user email:", error);
          return;
        }
        
        if (data?.email) {
          setUserEmail(data.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    }
  };

  const fetchSubscription = async () => {
    if (userId) {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching subscription for user ${userId}`);
        const subscription = await getCurrentSubscription(userId);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscription();
  };

  useEffect(() => {
    if (userId) {
      fetchSubscription();
      fetchUserEmail();
    }
  }, [userId]);

  return {
    currentPlan,
    loading,
    subscriptionInfo,
    error,
    errorDetails,
    refreshing,
    userEmail,
    fetchSubscription,
    handleRefresh
  };
}
