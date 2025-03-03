
import { supabase } from './client';
import { toast } from 'sonner';

// Get all user profiles for admin dashboard
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions:subscriptions(
        id,
        plan_id,
        status,
        current_period_end,
        created_at,
        updated_at
      )
    `);

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data || [];
};

// Create a new user account
export const createUserManually = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}) => {
  try {
    // 1. Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
      }
    });

    if (authError) throw authError;

    // 2. Update the profile with additional info if needed
    if (userData.isAdmin) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: userData.isAdmin })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;
    }

    return authData.user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    toast.error(`Failed to create user: ${error.message}`);
    throw error;
  }
};

// Delete a user and their data
export const deleteUser = async (userId: string) => {
  try {
    // Delete the user from auth
    const { error } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (error) throw error;

    toast.success('User deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error(`Failed to delete user: ${error.message}`);
    throw error;
  }
};

// Update a user's subscription plan
export const updateUserPlan = async (userId: string, planId: string) => {
  try {
    // Check if user has a subscription
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    if (subscriptions && subscriptions.length > 0) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          plan_id: planId,
          status: planId === 'free' ? 'canceled' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: planId === 'free' ? 'canceled' : 'active'
        });

      if (insertError) throw insertError;
    }

    toast.success(`User plan updated to ${planId}`);
    return true;
  } catch (error: any) {
    console.error('Error updating user plan:', error);
    toast.error(`Failed to update user plan: ${error.message}`);
    throw error;
  }
};

// Check for expired subscriptions and downgrade them
export const checkAndDowngradeExpiredSubscriptions = async () => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const { data, error } = await supabase.rpc('check_and_downgrade_expired_subscriptions');
    
    if (error) throw error;
    
    return { success: true, message: 'Expired subscriptions checked and downgraded if needed' };
  } catch (error: any) {
    console.error('Error checking expired subscriptions:', error);
    return { success: false, message: error.message };
  }
};
