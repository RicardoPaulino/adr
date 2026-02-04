
import { supabase } from './supabase';
import { ADR, ADRStatus } from '../types';

export const adrService = {
  async getADRs(statusFilter?: ADRStatus) {
    let query = supabase
      .from('adrs')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(adr => ({
      ...adr,
      author_email: adr.profiles?.full_name || 'Architect'
    })) as ADR[];
  },

  async createADR(adr: Omit<ADR, 'id' | 'created_at' | 'updated_at' | 'author_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create an ADR');

    const { data, error } = await supabase
      .from('adrs')
      .insert([{ 
        title: adr.title,
        status: adr.status,
        context: adr.context,
        decision: adr.decision,
        consequences: adr.consequences,
        author_id: user.id 
      }])
    if (error) {
      console.error('Error creating ADR:', error);
      throw error;
    }
    return data as ADR;
  },

  async updateADR(id: string, updates: Partial<Omit<ADR, 'id' | 'created_at' | 'updated_at' | 'author_id'>>) {
    const { data, error } = await supabase
      .from('adrs')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(full_name)')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      author_email: data.profiles?.full_name || 'Architect'
    } as ADR;
  },

  async deleteADR(id: string) {
    const { error } = await supabase
      .from('adrs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getADRById(id: string) {
    const { data, error } = await supabase
      .from('adrs')
      .select('*, profiles(full_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      author_email: data.profiles?.full_name
    } as ADR;
  }
};
