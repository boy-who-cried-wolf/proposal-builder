
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjpqgiahidqohjaaynqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcHFnaWFoaWRxb2hqYWF5bnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzE3MjEsImV4cCI6MjA1NjU0NzcyMX0.p-AoGmfNinZCd4na78MwMUh9D4YLocg3wCl_v0a5y60';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Helper function to add a service to user profile
export const addServiceToProfile = async (userId: string, service: string) => {
  // First get current services
  const { data: profile } = await supabase
    .from('profiles')
    .select('services, organization_id')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  if (profile.organization_id) {
    // If user has organization, add service to organization
    const { data: org } = await supabase
      .from('organizations')
      .select('services')
      .eq('id', profile.organization_id)
      .single();
      
    if (!org) {
      throw new Error('Organization not found');
    }
    
    // Create updated services array, ensuring no duplicates
    const currentServices = org.services || [];
    const updatedServices = [...new Set([...currentServices, service])];
    
    // Update the organization with new services
    const { data, error } = await supabase
      .from('organizations')
      .update({ services: updatedServices })
      .eq('id', profile.organization_id)
      .select();
      
    if (error) {
      console.error('Error adding service to organization:', error);
      throw error;
    }
    
    return data;
  } else {
    // If user doesn't have organization, add service to profile
    // Create updated services array, ensuring no duplicates
    const currentServices = profile.services || [];
    const updatedServices = [...new Set([...currentServices, service])];
    
    // Update the profile with new services
    const { data, error } = await supabase
      .from('profiles')
      .update({ services: updatedServices })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Error adding service to profile:', error);
      throw error;
    }
    
    return data;
  }
};

// Helper function to remove a service from user profile
export const removeServiceFromProfile = async (userId: string, service: string) => {
  // First get current services
  const { data: profile } = await supabase
    .from('profiles')
    .select('services, organization_id')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  if (profile.organization_id) {
    // If user has organization, remove service from organization
    const { data: org } = await supabase
      .from('organizations')
      .select('services')
      .eq('id', profile.organization_id)
      .single();
      
    if (!org) {
      throw new Error('Organization not found');
    }
    
    // Filter out the service to remove
    const currentServices = org.services || [];
    const updatedServices = currentServices.filter(s => s !== service);
    
    // Update the organization with new services
    const { data, error } = await supabase
      .from('organizations')
      .update({ services: updatedServices })
      .eq('id', profile.organization_id)
      .select();
      
    if (error) {
      console.error('Error removing service from organization:', error);
      throw error;
    }
    
    return data;
  } else {
    // If user doesn't have organization, remove service from profile
    // Filter out the service to remove
    const currentServices = profile.services || [];
    const updatedServices = currentServices.filter(s => s !== service);
    
    // Update the profile with new services
    const { data, error } = await supabase
      .from('profiles')
      .update({ services: updatedServices })
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Error removing service from profile:', error);
      throw error;
    }
    
    return data;
  }
};
