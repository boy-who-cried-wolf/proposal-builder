
import { supabase } from './client';

// Helper function to get user profile with organization settings
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organizations:organization_id (
        id,
        name,
        hourly_rate,
        client_rate,
        services,
        knowledge_base
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

// Helper function to update user profile including organization settings
export const updateUserProfile = async (userId: string, updates: any) => {
  console.log('Updating profile for user:', userId, 'with data:', updates);
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  console.log('Profile updated successfully:', data);
  return data;
};

// Helper function to link user to organization
export const linkUserToOrganization = async (userId: string, organizationId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ organization_id: organizationId })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error linking user to organization:', error);
    throw error;
  }

  return data;
};
