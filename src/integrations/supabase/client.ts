
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjpqgiahidqohjaaynqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcHFnaWFoaWRxb2hqYWF5bnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzE3MjEsImV4cCI6MjA1NjU0NzcyMX0.p-AoGmfNinZCd4na78MwMUh9D4YLocg3wCl_v0a5y60';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get user profile with organization settings
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
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

// Helper function to add a service to user profile
export const addServiceToProfile = async (userId: string, service: string) => {
  // First get current services
  const { data: profile } = await supabase
    .from('profiles')
    .select('services')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
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
};

// Helper function to remove a service from user profile
export const removeServiceFromProfile = async (userId: string, service: string) => {
  // First get current services
  const { data: profile } = await supabase
    .from('profiles')
    .select('services')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
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
};
