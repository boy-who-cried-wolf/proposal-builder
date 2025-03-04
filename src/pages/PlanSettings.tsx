
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePlanSubscription } from '@/hooks/usePlanSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { PlansGrid } from '@/components/subscription/PlansGrid';
import { CurrentSubscription } from '@/components/subscription/CurrentSubscription';
import { ErrorDetailsDialog } from '@/components/subscription/ErrorDetailsDialog';
import { ErrorMessage } from '@/components/subscription/ErrorMessage';
import { getPlansWithPricing } from '@/services/stripeService';
import { TestModeToggle } from '@/components/subscription/TestModeToggle';
import { checkIsAdmin } from '@/integrations/supabase/profileService';

const PlanSettings = () => {
  const { user } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdminUser(adminStatus);
      }
    };
    
    loadUserData();
  }, [user]);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const pricingData = await getPlansWithPricing();
        if (pricingData?.plans) {
          setPlans(pricingData.plans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  const {
    currentPlan,
    loading: subscriptionLoading,
    refreshing,
    checkoutLoading,
    cancelLoading,
    portalLoading,
    error,
    errorDetails,
    showErrorDialog,
    setShowErrorDialog,
    fetchSubscription,
    handleRefresh,
    handlePlanSelect,
    handleCancelSubscription,
    handleManageSubscription
  } = usePlanSubscription(user?.id);

  return (
    <Layout>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-gray-800">Subscription Plan</h1>
            <p className="text-gray-600 mt-2">Manage your subscription plan and billing details</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {currentPlan !== 'free' && (
              <Button 
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Test Mode Toggle (Only for admins) */}
        {isAdminUser && <TestModeToggle />}
        
        {error && <ErrorMessage error={error} />}
        
        <Card className="mb-8 border-[#E5DEFF]">
          <CardHeader className="bg-[#F1F0FB] rounded-t-lg border-b border-[#E5DEFF]">
            <CardTitle className="text-[#6E59A5] font-poppins">Current Subscription</CardTitle>
            <CardDescription className="text-[#8E9196]">
              Your current subscription plan and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CurrentSubscription 
              currentPlan={currentPlan} 
              loading={subscriptionLoading}
              cancelLoading={cancelLoading}
              handleCancelSubscription={handleCancelSubscription}
            />
          </CardContent>
        </Card>
        
        <Separator className="my-8" />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-4">Available Plans</h2>
          <p className="text-gray-600 mb-6">Choose the plan that works best for you and your business</p>
          
          <PlansGrid 
            plans={plans}
            currentPlan={currentPlan}
            loading={loading}
            checkoutLoading={checkoutLoading}
            onPlanSelect={handlePlanSelect}
          />
        </div>
        
        <ErrorDetailsDialog 
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          errorDetails={errorDetails}
        />
      </div>
    </Layout>
  );
};

export default PlanSettings;
