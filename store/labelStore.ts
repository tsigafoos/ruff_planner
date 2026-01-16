import { create } from 'zustand';
import { Platform } from 'react-native';
import { database } from '../lib/db';
import { supabase } from '../lib/supabase/client';

interface LabelStore {
  labels: any[];
  loading: boolean;
  fetchLabels: (userId: string) => Promise<void>;
  createLabel: (labelData: any) => Promise<any>;
  updateLabel: (labelId: string, updates: any) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
}

export const useLabelStore = create<LabelStore>((set, get) => ({
  labels: [],
  loading: false,

  fetchLabels: async (userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('labels')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        set({ labels: data || [], loading: false });
      } else {
        const { Q } = require('@nozbe/watermelondb');
        const labelsCollection = database.get('labels');
        const labels = await labelsCollection
          .query(Q.where('user_id', userId))
          .fetch();
        set({ labels, loading: false });
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
      set({ loading: false });
    }
  },

  createLabel: async (labelData: any) => {
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('labels')
          .insert({
            name: labelData.name,
            color: labelData.color || '#3B82F6',
            user_id: labelData.userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const currentLabels = get().labels;
        set({ labels: [data, ...currentLabels] });
        
        return data;
      } else {
        const labelsCollection = database.get('labels');
        const newLabel = await labelsCollection.create((label: any) => {
          label.name = labelData.name;
          label.color = labelData.color || '#3B82F6';
          label.userId = labelData.userId;
        });
        return newLabel;
      }
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  },

  updateLabel: async (labelId: string, updates: any) => {
    try {
      if (Platform.OS === 'web') {
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.color !== undefined) updateData.color = updates.color;

        const { error } = await supabase
          .from('labels')
          .update(updateData)
          .eq('id', labelId);
        
        if (error) throw error;
        
        const currentLabels = get().labels;
        const updatedLabels = currentLabels.map((label: any) =>
          label.id === labelId ? { ...label, ...updateData } : label
        );
        set({ labels: updatedLabels });
      } else {
        const labelsCollection = database.get('labels');
        const label = await labelsCollection.find(labelId);
        await label.update((labelRecord: any) => {
          if (updates.name !== undefined) labelRecord.name = updates.name;
          if (updates.color !== undefined) labelRecord.color = updates.color;
        });
      }
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  },

  deleteLabel: async (labelId: string) => {
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase
          .from('labels')
          .delete()
          .eq('id', labelId);
        
        if (error) throw error;
        
        const currentLabels = get().labels;
        set({ labels: currentLabels.filter((label: any) => label.id !== labelId) });
      } else {
        const labelsCollection = database.get('labels');
        const label = await labelsCollection.find(labelId);
        await label.markAsDeleted();
      }
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  },
}));
