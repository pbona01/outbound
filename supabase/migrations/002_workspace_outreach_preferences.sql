-- Workspace preferences for booking links and AI reply handling.
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS booking_link TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS ai_reply_mode TEXT NOT NULL DEFAULT 'suggest';
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_ai_reply_mode_check;
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_ai_reply_mode_check CHECK (ai_reply_mode IN ('suggest', 'approve', 'auto'));
