import { create } from 'zustand';
import { Platform } from 'react-native';
import { database } from '../lib/db';
import { supabase } from '../lib/supabase/client';

interface ProjectStore {
  projects: any[];
  loading: boolean;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (projectData: any) => Promise<any>;
  updateProject: (projectId: string, updates: any) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  ensureDefaultProject: (userId: string) => Promise<string>; // Returns the default project ID
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async (userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        // Normalize resources field: convert {} (object) to [] (array) for consistency
        const normalizedProjects = (data || []).map((project: any) => ({
          ...project,
          resources: Array.isArray(project.resources) ? project.resources : (project.resources && typeof project.resources === 'object' && Object.keys(project.resources).length > 0 ? [] : []),
        }));
        set({ projects: normalizedProjects, loading: false });
      } else {
        const projectsCollection = database.get('projects');
        const projects = await projectsCollection
          .query()
          .filter('user_id', userId)
          .fetch();
        set({ projects, loading: false });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ loading: false });
    }
  },

  ensureDefaultProject: async (userId: string) => {
    try {
      if (Platform.OS === 'web') {
        // Check if default project exists
        const { data: existing, error: fetchError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId)
          .eq('is_default', true)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw fetchError;
        }

        if (existing) {
          return existing.id;
        }

        // Create default project if it doesn't exist
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            name: 'To-Do List',
            color: '#6B7280',
            icon: 'list',
            project_type: 'waterfall',
            is_default: true,
            user_id: userId,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update local state
        const currentProjects = get().projects;
        set({ projects: [newProject, ...currentProjects] });

        return newProject.id;
      } else {
        // Native: Use WatermelonDB
        const projectsCollection = database.get('projects');
        const existing = await projectsCollection
          .query()
          .filter('user_id', userId)
          .filter('isDefault', true)
          .fetch();

        if (existing.length > 0) {
          return existing[0].id;
        }

        const newProject = await projectsCollection.create((project: any) => {
          project.name = 'To-Do List';
          project.color = '#6B7280';
          project.icon = 'list';
          project.isDefault = true;
          project.userId = userId;
        });

        return newProject.id;
      }
    } catch (error) {
      console.error('Error ensuring default project:', error);
      throw error;
    }
  },

  createProject: async (projectData: any) => {
    try {
      if (Platform.OS === 'web') {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            name: projectData.name,
            color: projectData.color || '#3B82F6',
            icon: projectData.icon || null,
            project_type: projectData.projectType || 'waterfall',
            objective: projectData.objective || null,
            scope_in: projectData.scopeIn || null,
            scope_out: projectData.scopeOut || null,
            deliverables: projectData.deliverables || [],
            milestones: projectData.milestones || [],
            start_date: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
            end_date: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
            resources: projectData.resources || {},
            team_roles: projectData.teamRoles || [],
            risks: projectData.risks || [],
            dependencies: projectData.dependencies || [],
            success_criteria: projectData.successCriteria || [],
            assumptions: projectData.assumptions || [],
            constraints: projectData.constraints || null,
            documentation: projectData.documentation || [],
            team_management: projectData.teamManagement || null,
            is_default: false, // Ensure user-created projects are not marked as default
            user_id: projectData.userId,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const currentProjects = get().projects;
        set({ projects: [data, ...currentProjects] });
        
        return data;
      } else {
        const projectsCollection = database.get('projects');
        const newProject = await projectsCollection.create((project: any) => {
          project.name = projectData.name;
          project.color = projectData.color || '#3B82F6';
          project.icon = projectData.icon || undefined;
          project.isDefault = false;
          project.userId = projectData.userId;
        });
        return newProject;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProject: async (projectId: string, updates: any) => {
    try {
      if (Platform.OS === 'web') {
        // Prevent updating is_default flag
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.color !== undefined) updateData.color = updates.color;
        if (updates.icon !== undefined) updateData.icon = updates.icon;
        if (updates.projectType !== undefined) updateData.project_type = updates.projectType;
        if (updates.objective !== undefined) updateData.objective = updates.objective;
        if (updates.scopeIn !== undefined) updateData.scope_in = updates.scopeIn;
        if (updates.scopeOut !== undefined) updateData.scope_out = updates.scopeOut;
        if (updates.deliverables !== undefined) updateData.deliverables = updates.deliverables;
        if (updates.milestones !== undefined) updateData.milestones = updates.milestones;
        if (updates.startDate !== undefined) updateData.start_date = updates.startDate ? new Date(updates.startDate).toISOString() : null;
        if (updates.endDate !== undefined) updateData.end_date = updates.endDate ? new Date(updates.endDate).toISOString() : null;
        if (updates.resources !== undefined) {
          // Ensure resources is a valid JSON array for JSONB column
          // Supabase JSONB columns need proper array format
          updateData.resources = Array.isArray(updates.resources) ? updates.resources : [];
        }
        if (updates.teamRoles !== undefined) updateData.team_roles = updates.teamRoles;
        if (updates.risks !== undefined) updateData.risks = updates.risks;
        if (updates.dependencies !== undefined) updateData.dependencies = updates.dependencies;
        if (updates.successCriteria !== undefined) updateData.success_criteria = updates.successCriteria;
        if (updates.assumptions !== undefined) updateData.assumptions = updates.assumptions;
        if (updates.constraints !== undefined) updateData.constraints = updates.constraints;
        if (updates.documentation !== undefined) updateData.documentation = updates.documentation;
        if (updates.team_management !== undefined) updateData.team_management = updates.team_management;
        // Note: is_default is intentionally not updatable

        const { error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', projectId);
        
        if (error) throw error;
        
        const currentProjects = get().projects;
        const updatedProjects = currentProjects.map((project: any) =>
          project.id === projectId 
            ? { 
                ...project, 
                ...updateData,
                // Normalize resources field if it was updated
                resources: updateData.resources !== undefined 
                  ? (Array.isArray(updateData.resources) ? updateData.resources : [])
                  : (Array.isArray(project.resources) ? project.resources : [])
              } 
            : project
        );
        set({ projects: updatedProjects });
      } else {
        const projectsCollection = database.get('projects');
        const project = await projectsCollection.find(projectId);
        await project.update((projectRecord: any) => {
          if (updates.name !== undefined) projectRecord.name = updates.name;
          if (updates.color !== undefined) projectRecord.color = updates.color;
          if (updates.icon !== undefined) projectRecord.icon = updates.icon;
          // Note: isDefault is intentionally not updatable
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      if (Platform.OS === 'web') {
        // Check if this is the default project
        const projects = get().projects;
        const project = projects.find((p: any) => p.id === projectId);
        
        if (project?.is_default) {
          throw new Error('Cannot delete the default To-Do List project');
        }

        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
        
        if (error) throw error;
        
        const currentProjects = get().projects;
        set({ projects: currentProjects.filter((project: any) => project.id !== projectId) });
      } else {
        const projectsCollection = database.get('projects');
        const project = await projectsCollection.find(projectId);
        
        if (project.isDefault) {
          throw new Error('Cannot delete the default To-Do List project');
        }
        
        await project.markAsDeleted();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
}));
