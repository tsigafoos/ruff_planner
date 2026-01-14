import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { Team, TeamMember, TeamInvite, ProjectShare, TeamRole, ProjectShareRole, InviteStatus } from '../types';

// Generate short invite token (8 chars)
function generateInviteToken(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface TeamStore {
  // State
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  invites: TeamInvite[];
  projectShares: ProjectShare[];
  loading: boolean;

  // Team CRUD
  fetchTeams: (userId: string) => Promise<void>;
  fetchTeamById: (teamId: string) => Promise<Team | null>;
  createTeam: (name: string, note?: string, userId?: string) => Promise<Team | null>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  setCurrentTeam: (team: Team | null) => void;

  // Member management
  fetchMembers: (teamId: string) => Promise<void>;
  addMember: (teamId: string, userId: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;

  // Invite management
  fetchInvites: (teamId: string) => Promise<void>;
  createInvite: (teamId: string, email: string, role: TeamRole, invitedBy: string) => Promise<TeamInvite | null>;
  acceptInvite: (token: string, userId: string) => Promise<{ success: boolean; teamId?: string; error?: string }>;
  revokeInvite: (inviteId: string) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;
  getInviteByToken: (token: string) => Promise<TeamInvite | null>;

  // Project sharing
  fetchProjectShares: (projectId: string) => Promise<void>;
  shareProjectWithTeam: (projectId: string, teamId: string, role: ProjectShareRole) => Promise<void>;
  shareProjectWithUser: (projectId: string, userId: string, role: ProjectShareRole) => Promise<void>;
  updateShareRole: (shareId: string, role: ProjectShareRole) => Promise<void>;
  removeShare: (shareId: string) => Promise<void>;
  getSharedProjects: (userId: string) => Promise<string[]>; // Returns project IDs user has access to
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  currentTeam: null,
  members: [],
  invites: [],
  projectShares: [],
  loading: false,

  // ============================================
  // Team CRUD
  // ============================================

  fetchTeams: async (userId: string) => {
    set({ loading: true });
    try {
      if (Platform.OS === 'web') {
        // Get teams where user is owner or member
        const { data: membershipData, error: memberError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId);

        if (memberError) throw memberError;

        const teamIds = membershipData?.map((m: any) => m.team_id) || [];

        if (teamIds.length === 0) {
          set({ teams: [], loading: false });
          return;
        }

        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const teams: Team[] = (data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          note: t.note,
          ownerId: t.owner_id,
          createdAt: new Date(t.created_at),
          updatedAt: new Date(t.updated_at),
        }));

        set({ teams, loading: false });
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      set({ loading: false });
    }
  },

  fetchTeamById: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        note: data.note,
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as Team;
    } catch (error) {
      console.error('Error fetching team:', error);
      return null;
    }
  },

  createTeam: async (name: string, note?: string, userId?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const ownerId = userId || userData?.user?.id;

      if (!ownerId) throw new Error('No user ID available');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          note: note || null,
          owner_id: ownerId,
        })
        .select()
        .single();

      if (error) {
        // Check for common errors and provide helpful messages
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('Database not set up. Please run the team collaboration migration in Supabase.');
        }
        throw new Error(error.message || 'Failed to create team');
      }

      const newTeam: Team = {
        id: data.id,
        name: data.name,
        note: data.note,
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set((state) => ({ teams: [newTeam, ...state.teams] }));
      return newTeam;
    } catch (error: any) {
      console.error('Error creating team:', error);
      // Re-throw the error so callers can handle it
      throw error;
    }
  },

  updateTeam: async (teamId: string, updates: Partial<Team>) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.note !== undefined) updateData.note = updates.note;

      const { error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId);

      if (error) throw error;

      set((state) => ({
        teams: state.teams.map((t) =>
          t.id === teamId ? { ...t, ...updates } : t
        ),
        currentTeam: state.currentTeam?.id === teamId
          ? { ...state.currentTeam, ...updates }
          : state.currentTeam,
      }));
    } catch (error) {
      console.error('Error updating team:', error);
    }
  },

  deleteTeam: async (teamId: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
      }));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  },

  setCurrentTeam: (team: Team | null) => {
    set({ currentTeam: team });
  },

  // ============================================
  // Member Management
  // ============================================

  fetchMembers: async (teamId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const members: TeamMember[] = (data || []).map((m: any) => ({
        id: m.id,
        teamId: m.team_id,
        userId: m.user_id,
        role: m.role as TeamRole,
        joinedAt: new Date(m.joined_at),
        user: m.profiles ? {
          email: m.profiles.email || '',
          firstName: m.profiles.first_name,
          lastName: m.profiles.last_name,
          avatar: m.profiles.avatar_url,
        } : undefined,
      }));

      set({ members, loading: false });
    } catch (error) {
      console.error('Error fetching members:', error);
      set({ loading: false });
    }
  },

  addMember: async (teamId: string, userId: string, role: TeamRole) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      const newMember: TeamMember = {
        id: data.id,
        teamId: data.team_id,
        userId: data.user_id,
        role: data.role as TeamRole,
        joinedAt: new Date(data.joined_at),
      };

      set((state) => ({ members: [...state.members, newMember] }));
    } catch (error) {
      console.error('Error adding member:', error);
    }
  },

  updateMemberRole: async (memberId: string, role: TeamRole) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, role } : m
        ),
      }));
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
      }));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  },

  // ============================================
  // Invite Management
  // ============================================

  fetchInvites: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invites: TeamInvite[] = (data || []).map((i: any) => ({
        id: i.id,
        teamId: i.team_id,
        email: i.email,
        role: i.role as TeamRole,
        token: i.token,
        invitedBy: i.invited_by,
        status: i.status as InviteStatus,
        createdAt: new Date(i.created_at),
        expiresAt: new Date(i.expires_at),
      }));

      set({ invites });
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  },

  createInvite: async (teamId: string, email: string, role: TeamRole, invitedBy: string) => {
    try {
      const token = generateInviteToken();

      const { data, error } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          email,
          role,
          token,
          invited_by: invitedBy,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const newInvite: TeamInvite = {
        id: data.id,
        teamId: data.team_id,
        email: data.email,
        role: data.role as TeamRole,
        token: data.token,
        invitedBy: data.invited_by,
        status: data.status as InviteStatus,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
      };

      set((state) => ({ invites: [newInvite, ...state.invites] }));
      return newInvite;
    } catch (error) {
      console.error('Error creating invite:', error);
      return null;
    }
  },

  getInviteByToken: async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          *,
          teams (*)
        `)
        .eq('token', token)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        teamId: data.team_id,
        email: data.email,
        role: data.role as TeamRole,
        token: data.token,
        invitedBy: data.invited_by,
        status: data.status as InviteStatus,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        team: data.teams ? {
          id: data.teams.id,
          name: data.teams.name,
          note: data.teams.note,
          ownerId: data.teams.owner_id,
          createdAt: new Date(data.teams.created_at),
          updatedAt: new Date(data.teams.updated_at),
        } : undefined,
      } as TeamInvite;
    } catch (error) {
      console.error('Error fetching invite by token:', error);
      return null;
    }
  },

  acceptInvite: async (token: string, userId: string) => {
    try {
      // Get the invite
      const invite = await get().getInviteByToken(token);
      
      if (!invite) {
        return { success: false, error: 'Invite not found' };
      }

      if (invite.status !== 'pending') {
        return { success: false, error: `Invite is ${invite.status}` };
      }

      if (new Date(invite.expiresAt) < new Date()) {
        // Update status to expired
        await supabase
          .from('team_invites')
          .update({ status: 'expired' })
          .eq('id', invite.id);
        return { success: false, error: 'Invite has expired' };
      }

      // Add user to team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invite.teamId,
          user_id: userId,
          role: invite.role,
        });

      if (memberError) {
        if (memberError.code === '23505') {
          return { success: false, error: 'You are already a member of this team' };
        }
        throw memberError;
      }

      // Update invite status
      await supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      return { success: true, teamId: invite.teamId };
    } catch (error) {
      console.error('Error accepting invite:', error);
      return { success: false, error: 'Failed to accept invite' };
    }
  },

  revokeInvite: async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;

      set((state) => ({
        invites: state.invites.map((i) =>
          i.id === inviteId ? { ...i, status: 'revoked' as InviteStatus } : i
        ),
      }));
    } catch (error) {
      console.error('Error revoking invite:', error);
    }
  },

  resendInvite: async (inviteId: string) => {
    try {
      // Generate new token and extend expiry
      const newToken = generateInviteToken();
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);

      const { error } = await supabase
        .from('team_invites')
        .update({
          token: newToken,
          status: 'pending',
          expires_at: newExpiry.toISOString(),
        })
        .eq('id', inviteId);

      if (error) throw error;

      set((state) => ({
        invites: state.invites.map((i) =>
          i.id === inviteId
            ? { ...i, token: newToken, status: 'pending' as InviteStatus, expiresAt: newExpiry }
            : i
        ),
      }));
    } catch (error) {
      console.error('Error resending invite:', error);
    }
  },

  // ============================================
  // Project Sharing
  // ============================================

  fetchProjectShares: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select(`
          *,
          teams (*),
          profiles:shared_with_user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('project_id', projectId);

      if (error) throw error;

      const shares: ProjectShare[] = (data || []).map((s: any) => ({
        id: s.id,
        projectId: s.project_id,
        teamId: s.team_id,
        sharedWithUserId: s.shared_with_user_id,
        role: s.role as ProjectShareRole,
        createdAt: new Date(s.created_at),
        team: s.teams ? {
          id: s.teams.id,
          name: s.teams.name,
          note: s.teams.note,
          ownerId: s.teams.owner_id,
          createdAt: new Date(s.teams.created_at),
          updatedAt: new Date(s.teams.updated_at),
        } : undefined,
        user: s.profiles ? {
          email: s.profiles.email,
          firstName: s.profiles.first_name,
          lastName: s.profiles.last_name,
        } : undefined,
      }));

      set({ projectShares: shares });
    } catch (error) {
      console.error('Error fetching project shares:', error);
    }
  },

  shareProjectWithTeam: async (projectId: string, teamId: string, role: ProjectShareRole) => {
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          team_id: teamId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      const newShare: ProjectShare = {
        id: data.id,
        projectId: data.project_id,
        teamId: data.team_id,
        role: data.role as ProjectShareRole,
        createdAt: new Date(data.created_at),
      };

      set((state) => ({ projectShares: [...state.projectShares, newShare] }));
    } catch (error) {
      console.error('Error sharing project with team:', error);
    }
  },

  shareProjectWithUser: async (projectId: string, userId: string, role: ProjectShareRole) => {
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .insert({
          project_id: projectId,
          shared_with_user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      const newShare: ProjectShare = {
        id: data.id,
        projectId: data.project_id,
        sharedWithUserId: data.shared_with_user_id,
        role: data.role as ProjectShareRole,
        createdAt: new Date(data.created_at),
      };

      set((state) => ({ projectShares: [...state.projectShares, newShare] }));
    } catch (error) {
      console.error('Error sharing project with user:', error);
    }
  },

  updateShareRole: async (shareId: string, role: ProjectShareRole) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ role })
        .eq('id', shareId);

      if (error) throw error;

      set((state) => ({
        projectShares: state.projectShares.map((s) =>
          s.id === shareId ? { ...s, role } : s
        ),
      }));
    } catch (error) {
      console.error('Error updating share role:', error);
    }
  },

  removeShare: async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      set((state) => ({
        projectShares: state.projectShares.filter((s) => s.id !== shareId),
      }));
    } catch (error) {
      console.error('Error removing share:', error);
    }
  },

  getSharedProjects: async (userId: string) => {
    try {
      // Get project IDs shared directly with user
      const { data: directShares } = await supabase
        .from('project_shares')
        .select('project_id')
        .eq('shared_with_user_id', userId);

      // Get team IDs user belongs to
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      const teamIds = memberships?.map((m: any) => m.team_id) || [];

      // Get project IDs shared with user's teams
      let teamShares: any[] = [];
      if (teamIds.length > 0) {
        const { data } = await supabase
          .from('project_shares')
          .select('project_id')
          .in('team_id', teamIds);
        teamShares = data || [];
      }

      // Combine and dedupe
      const projectIds = [
        ...new Set([
          ...(directShares?.map((s: any) => s.project_id) || []),
          ...teamShares.map((s: any) => s.project_id),
        ]),
      ];

      return projectIds;
    } catch (error) {
      console.error('Error getting shared projects:', error);
      return [];
    }
  },
}));
