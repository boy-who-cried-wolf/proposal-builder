
import { supabase } from './client';

// Helper function to create a new organization
export const createOrganization = async (name: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    throw error;
  }

  return data;
};

// Helper function to update organization
export const updateOrganization = async (orgId: string, updates: any) => {
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
};
