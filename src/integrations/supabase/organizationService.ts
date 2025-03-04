
import { supabase } from './client';

// Helper function to create a new organization
export const createOrganization = async (name: string, userId: string) => {
  try {
    console.log('Creating organization with name:', name);

    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        name,
        user_id: userId  // Using owner_id for RLS policy
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating organization:', error);
      throw error;
    }

    console.log('Organization created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createOrganization:', error);
    throw error;
  }
};

// Helper function to update organization
export const updateOrganization = async (orgId: string, updates: any) => {
  try {
    console.log('Updating organization:', orgId, 'with data:', updates);

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select();

    if (error) {
      console.error('Error updating organization:', error);
      throw error;
    }

    console.log('Organization updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateOrganization:', error);
    throw error;
  }
};

// Helper function to get organization by ID
export const getOrganization = async (orgId: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrganization:', error);
    throw error;
  }
};

// Helper function to get organization by User Id
export const getOrganizationByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrganization:', error);
    throw error;
  }
};
