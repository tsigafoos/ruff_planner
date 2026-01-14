-- Team Collaboration Migration
-- Adds teams, members, invites, and project sharing tables
-- Run this in Supabase SQL Editor

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  note TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team policies
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team member policies
CREATE POLICY "Team members can view other members" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Team owners/admins can add members" ON team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Team owners/admins can update member roles" ON team_members
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners/admins can remove members" ON team_members
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    user_id = auth.uid() -- Users can leave teams
  );

-- ============================================
-- TEAM INVITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Invite policies
CREATE POLICY "Team owners/admins can view invites" ON team_invites
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Team owners/admins can create invites" ON team_invites
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
  );

CREATE POLICY "Team owners/admins can update invites" ON team_invites
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners/admins can delete invites" ON team_invites
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Public policy for accepting invites (anyone with valid token)
CREATE POLICY "Anyone can view invite by token" ON team_invites
  FOR SELECT USING (true);

-- ============================================
-- PROJECT SHARES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'commenter', 'editor', 'co_owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Either team_id or shared_with_user_id must be set, but not both
  CONSTRAINT share_target_check CHECK (
    (team_id IS NOT NULL AND shared_with_user_id IS NULL) OR
    (team_id IS NULL AND shared_with_user_id IS NOT NULL)
  ),
  UNIQUE(project_id, team_id),
  UNIQUE(project_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- Project share policies
CREATE POLICY "Users can view shares for their projects or shares with them" ON project_shares
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()) OR
    shared_with_user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can create shares" ON project_shares
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can update shares" ON project_shares
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can delete shares" ON project_shares
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- ============================================
-- PROFILE UPDATES
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_mode_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Email settings for sending invites (SMTP config)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{}'::jsonb;
-- Structure: { smtp_host, smtp_port, smtp_user, smtp_pass, imap_host, imap_port, imap_user, imap_pass }

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_team_id ON project_shares(team_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_user_id ON project_shares(shared_with_user_id);

-- ============================================
-- HELPER FUNCTION: Generate short invite token
-- ============================================
CREATE OR REPLACE FUNCTION generate_invite_token(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-add owner as team member
-- ============================================
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_owner_as_member
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- ============================================
-- TRIGGER: Update team updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_timestamp
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_team_timestamp();
