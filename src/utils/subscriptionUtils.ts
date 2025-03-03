
import { checkAndDowngradeExpiredSubscriptions } from '@/integrations/supabase/adminService';

// This function should be called periodically in the application
// For example, it could be called when the user logs in or on app startup
export const checkForExpiredSubscriptions = async () => {
  try {
    // Only call this in production to avoid development issues
    if (process.env.NODE_ENV === 'production') {
      console.log('Checking for expired subscriptions...');
      const result = await checkAndDowngradeExpiredSubscriptions();
      console.log('Subscription check result:', result);
    }
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};
