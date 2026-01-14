/**
 * Permission checking utilities for team collaboration
 */

import { Project, ProjectShare, Team, TeamMember, ProjectShareRole, TeamRole } from '../types';

/**
 * Check if a user can view a project
 * - Owner can always view
 * - Anyone with a share (direct or via team) can view
 */
export function canViewProject(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): boolean {
  // Owner can always view
  if (project.userId === userId) return true;

  // Check direct user share
  const directShare = shares.find(s => s.sharedWithUserId === userId);
  if (directShare) return true;

  // Check team shares
  const teamIds = teamMemberships.map(m => m.teamId);
  const teamShare = shares.find(s => s.teamId && teamIds.includes(s.teamId));
  if (teamShare) return true;

  return false;
}

/**
 * Check if a user can edit a project's tasks
 * - Owner can always edit
 * - Editor or Co-owner share can edit
 */
export function canEditTasks(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): boolean {
  // Owner can always edit
  if (project.userId === userId) return true;

  // Check direct user share
  const directShare = shares.find(s => s.sharedWithUserId === userId);
  if (directShare && ['editor', 'co_owner'].includes(directShare.role)) {
    return true;
  }

  // Check team shares
  const teamIds = teamMemberships.map(m => m.teamId);
  const teamShare = shares.find(s => s.teamId && teamIds.includes(s.teamId));
  if (teamShare && ['editor', 'co_owner'].includes(teamShare.role)) {
    return true;
  }

  return false;
}

/**
 * Check if a user can edit the project itself (settings, etc.)
 * - Owner can always edit project
 * - Co-owner share can edit project
 */
export function canEditProject(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): boolean {
  // Owner can always edit
  if (project.userId === userId) return true;

  // Check direct user share
  const directShare = shares.find(s => s.sharedWithUserId === userId);
  if (directShare && directShare.role === 'co_owner') {
    return true;
  }

  // Check team shares
  const teamIds = teamMemberships.map(m => m.teamId);
  const teamShare = shares.find(s => s.teamId && teamIds.includes(s.teamId));
  if (teamShare && teamShare.role === 'co_owner') {
    return true;
  }

  return false;
}

/**
 * Check if a user can comment on tasks
 * - Owner can always comment
 * - Commenter, Editor, or Co-owner share can comment
 */
export function canComment(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): boolean {
  // Owner can always comment
  if (project.userId === userId) return true;

  // Check direct user share
  const directShare = shares.find(s => s.sharedWithUserId === userId);
  if (directShare && ['commenter', 'editor', 'co_owner'].includes(directShare.role)) {
    return true;
  }

  // Check team shares
  const teamIds = teamMemberships.map(m => m.teamId);
  const teamShare = shares.find(s => s.teamId && teamIds.includes(s.teamId));
  if (teamShare && ['commenter', 'editor', 'co_owner'].includes(teamShare.role)) {
    return true;
  }

  return false;
}

/**
 * Check if a user can manage project sharing
 * - Owner can always manage sharing
 * - Co-owner share can manage sharing
 */
export function canManageSharing(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): boolean {
  return canEditProject(userId, project, shares, teamMemberships);
}

/**
 * Check if a user can manage a team (add/remove members, change roles)
 * - Team owner can always manage
 * - Team admin can manage (except owner)
 */
export function canManageTeam(
  userId: string,
  team: Team,
  members: TeamMember[]
): boolean {
  // Team owner can always manage
  if (team.ownerId === userId) return true;

  // Check if user is an admin
  const userMember = members.find(m => m.userId === userId);
  if (userMember && userMember.role === 'admin') {
    return true;
  }

  return false;
}

/**
 * Check if a user can invite members to a team
 * - Team owner can always invite
 * - Team admin can invite
 */
export function canInviteToTeam(
  userId: string,
  team: Team,
  members: TeamMember[]
): boolean {
  return canManageTeam(userId, team, members);
}

/**
 * Check if a user can remove another user from a team
 * - Team owner can remove anyone
 * - Admin can remove members and guests, but not other admins or owner
 */
export function canRemoveMember(
  userId: string,
  team: Team,
  members: TeamMember[],
  targetMember: TeamMember
): boolean {
  // Can't remove self (use leave team instead)
  if (targetMember.userId === userId) return false;

  // Can't remove owner
  if (targetMember.role === 'owner') return false;

  // Team owner can remove anyone else
  if (team.ownerId === userId) return true;

  // Check if user is an admin
  const userMember = members.find(m => m.userId === userId);
  if (userMember && userMember.role === 'admin') {
    // Admins can remove members and guests, but not other admins
    return ['member', 'guest'].includes(targetMember.role);
  }

  return false;
}

/**
 * Check if a user can change another member's role
 * - Team owner can change any role except owner
 * - Admin can change member and guest roles
 */
export function canChangeRole(
  userId: string,
  team: Team,
  members: TeamMember[],
  targetMember: TeamMember,
  newRole: TeamRole
): boolean {
  // Can't change own role (except owner)
  if (targetMember.userId === userId && team.ownerId !== userId) return false;

  // Can't change to/from owner
  if (targetMember.role === 'owner' || newRole === 'owner') return false;

  // Team owner can change any role
  if (team.ownerId === userId) return true;

  // Check if user is an admin
  const userMember = members.find(m => m.userId === userId);
  if (userMember && userMember.role === 'admin') {
    // Admins can change member and guest roles (but not to admin)
    if (['member', 'guest'].includes(targetMember.role)) {
      return ['member', 'guest'].includes(newRole);
    }
  }

  return false;
}

/**
 * Get the effective role a user has on a project
 * Returns the highest permission level from all sources
 */
export function getEffectiveProjectRole(
  userId: string,
  project: Project,
  shares: ProjectShare[],
  teamMemberships: { teamId: string; role: TeamRole }[] = []
): 'owner' | ProjectShareRole | null {
  // Project owner
  if (project.userId === userId) return 'owner';

  const roleHierarchy: (ProjectShareRole | 'owner')[] = ['viewer', 'commenter', 'editor', 'co_owner', 'owner'];
  let highestRole: ProjectShareRole | null = null;

  // Check direct share
  const directShare = shares.find(s => s.sharedWithUserId === userId);
  if (directShare) {
    highestRole = directShare.role;
  }

  // Check team shares
  const teamIds = teamMemberships.map(m => m.teamId);
  for (const share of shares) {
    if (share.teamId && teamIds.includes(share.teamId)) {
      if (!highestRole || roleHierarchy.indexOf(share.role) > roleHierarchy.indexOf(highestRole)) {
        highestRole = share.role;
      }
    }
  }

  return highestRole;
}

/**
 * Get all projects a user has access to (owned or shared)
 */
export async function getAccessibleProjectIds(
  userId: string,
  shares: ProjectShare[],
  teamMemberships: { teamId: string }[] = []
): Promise<Set<string>> {
  const accessibleIds = new Set<string>();

  // Add directly shared projects
  shares.forEach(share => {
    if (share.sharedWithUserId === userId) {
      accessibleIds.add(share.projectId);
    }
  });

  // Add team-shared projects
  const teamIds = new Set(teamMemberships.map(m => m.teamId));
  shares.forEach(share => {
    if (share.teamId && teamIds.has(share.teamId)) {
      accessibleIds.add(share.projectId);
    }
  });

  return accessibleIds;
}
