
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsAdmin } from '@/integrations/supabase/profileService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Use the dedicated admin check function to avoid RLS issues
        const adminStatus = await checkIsAdmin(user.id);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Error checking permissions");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Show loading state while checking authentication and admin status
  if (authLoading || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="ml-2 text-black">Checking permissions...</div>
      </div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is not an admin, redirect to the main page
  if (!isAdmin) {
    toast.error("You don't have permission to access this page");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated and is an admin, allow access
  return <Outlet />;
};
