import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { EmailSettings } from '../types';

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
  // Team Mode fields
  team_mode_enabled?: boolean;
  default_team_id?: string;
  email_settings?: EmailSettings;
  created_at?: string;
  updated_at?: string;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<void>;
  // Team mode helpers
  setTeamModeEnabled: (userId: string, enabled: boolean) => Promise<void>;
  setDefaultTeam: (userId: string, teamId: string | null) => Promise<void>;
  updateEmailSettings: (userId: string, settings: EmailSettings) => Promise<void>;
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

  setTeamModeEnabled: async (userId: string, enabled: boolean) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          team_mode_enabled: enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, team_mode_enabled: enabled } : data,
      }));
    } catch (error) {
      console.error('Error setting team mode:', error);
      throw error;
    }
  },

  setDefaultTeam: async (userId: string, teamId: string | null) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          default_team_id: teamId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, default_team_id: teamId || undefined } : data,
      }));
    } catch (error) {
      console.error('Error setting default team:', error);
      throw error;
    }
  },

  updateEmailSettings: async (userId: string, settings: EmailSettings) => {
    try {
      // Convert to snake_case for database
      const dbSettings = {
        smtp_host: settings.smtpHost,
        smtp_port: settings.smtpPort,
        smtp_user: settings.smtpUser,
        smtp_pass: settings.smtpPass,
        smtp_secure: settings.smtpSecure,
        imap_host: settings.imapHost,
        imap_port: settings.imapPort,
        imap_user: settings.imapUser,
        imap_pass: settings.imapPass,
        imap_secure: settings.imapSecure,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          email_settings: dbSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, email_settings: settings } : data,
      }));
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  },
}));
