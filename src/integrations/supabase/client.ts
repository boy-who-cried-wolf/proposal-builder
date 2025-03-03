
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjpqgiahidqohjaaynqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcHFnaWFoaWRxb2hqYWF5bnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NzE3MjEsImV4cCI6MjA1NjU0NzcyMX0.p-AoGmfNinZCd4na78MwMUh9D4YLocg3wCl_v0a5y60';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
