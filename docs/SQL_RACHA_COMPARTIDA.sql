-- Ejecutar en Supabase → SQL Editor
-- Tabla para rachas compartidas entre dos usuarios

CREATE TABLE IF NOT EXISTS shared_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | broken
  last_activity_1 TIMESTAMPTZ,
  last_activity_2 TIMESTAMPTZ,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);
