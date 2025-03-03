
import { supabase } from '@/integrations/supabase/client';
import { SectionTemplate } from '@/types/proposal';

export async function getSectionTemplates(): Promise<SectionTemplate[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('section_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching section templates:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSectionTemplates:', error);
    return [];
  }
}
