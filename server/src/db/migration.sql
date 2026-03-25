-- 1. Update Users Table Roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'mentor', 'student'));
UPDATE users SET role = 'admin' WHERE role = 'super_admin';
UPDATE users SET role = 'student' WHERE role = 'user';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';

-- 2. Update Groups Table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS color TEXT;

-- 3. Update Group Members Roles
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_role_check;
ALTER TABLE group_members ADD CONSTRAINT group_members_role_check CHECK (role IN ('owner', 'admin', 'mentor', 'student'));
UPDATE group_members SET role = 'student' WHERE role = 'member';
ALTER TABLE group_members ALTER COLUMN role SET DEFAULT 'student';

-- 4. Update Messages Table for Verification
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_doubt BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'incorrect', 'none')) DEFAULT 'none';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);

-- 5. Create New Moderation & Notification Tables
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
