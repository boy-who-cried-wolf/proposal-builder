
import { supabase } from './client';

// Helper function to add a service to user profile or organization
export const addServiceToProfile = async (userId: string, service: string) => {
  try {
    // First get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('services, organization_id')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Profile not found');
    }
    
    if (profile.organization_id) {
      // If user has organization, add service to organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('services')
        .eq('id', profile.organization_id)
        .single();
        
      if (orgError) {
        console.error('Error fetching organization:', orgError);
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
  } catch (error) {
    console.error('Error in addServiceToProfile:', error);
    throw error;
  }
};

// Helper function to remove a service from user profile or organization
export const removeServiceFromProfile = async (userId: string, service: string) => {
  try {
    // First get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('services, organization_id')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Profile not found');
    }
    
    if (profile.organization_id) {
      // If user has organization, remove service from organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('services')
        .eq('id', profile.organization_id)
        .single();
        
      if (orgError) {
        console.error('Error fetching organization:', orgError);
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
  } catch (error) {
    console.error('Error in removeServiceFromProfile:', error);
    throw error;
  }
};
