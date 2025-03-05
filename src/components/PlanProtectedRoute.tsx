
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanSubscription } from '@/hooks/usePlanSubscription';
import { toast } from 'sonner';
import { UpgradeOverlay } from './UpgradeOverlay';

interface PlanProtectedRouteProps {
  requiredPlans: string[];
  featureName: string;
  proposalLimit?: number;
}

export const PlanProtectedRoute: React.FC<PlanProtectedRouteProps> = ({
  requiredPlans,
  featureName,
  proposalLimit
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { currentPlan, loading: planLoading } = usePlanSubscription(user?.id);

  // Show combined loading state
  if (loading || planLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  // Check if user is not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user's current plan is allowed to access this route
  const hasPlanAccess = requiredPlans.includes(currentPlan);

  // If user doesn't have access, redirect to plans page with a message
  // if (!hasPlanAccess) {
  //   // Show a toast notification about the restricted access
  //   toast.error(`This feature (${featureName}) requires ${requiredPlans.join(' or ')} plan`);

  //   // Redirect to the plans page
  //   return <Navigate to="/account-settings/plan" state={{ from: location }} replace />;
  // }

  // User has the required plan, allow access
  return (
    <UpgradeOverlay open={!hasPlanAccess} message={`This feature (${featureName}) requires ${requiredPlans.join(' or ')} plan`}>
      <Outlet />
    </UpgradeOverlay>
  );
};
