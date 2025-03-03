
import { supabase } from './client';

// Helper function to get user profile with organization settings
export const getUserProfile = async (userId: string) => {
  try {
    // First, get the profile to check if it has an organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, organization_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    // If the profile has an organization_id, fetch the organization details
    if (profile.organization_id) {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, hourly_rate, client_rate, services, knowledge_base')
        .eq('id', profile.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }

      // Combine profile with organization data
      return {
        ...profile,
        organizations: organization
      };
    }

    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
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
