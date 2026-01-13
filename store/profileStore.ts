import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase/client';

interface Profile {
  id?: string;
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  location?: string;
  phone_number?: string;
  social_links?: Record<string, string>;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,

  fetchProfile: async (userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
        
        set({ profile: data || null, loading: false });
      } else {
        // For native, we'd use WatermelonDB, but for now just set to null
        set({ profile: null, loading: false });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ loading: false });
    }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    try {
      if (Platform.OS === 'web') {
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString(),
        };
        
        const { data, error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            ...updateData,
          }, {
            onConflict: 'user_id',
          })
          .select()
          .single();
        
        if (error) throw error;
        
        set({ profile: data });
      } else {
        // For native, we'd use WatermelonDB
        console.warn('Profile updates on native not yet implemented');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}));
