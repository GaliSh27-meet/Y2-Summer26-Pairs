/*
# FitFlow AI — initial schema (single-tenant, no auth)

1. Overview
   FitFlow AI is a single-tenant web app (no sign-in) where two AI agents collaborate:
   - Agent 1 "Workout Coach" interviews the user and generates a personalized workout plan.
   - Agent 2 "Calendar Organizer" turns the workout plan into calendar events and an ICS file.
   This migration creates the tables needed to persist chat conversations, generated
   workout plans, and the calendar events derived from them so the user can revisit
   their plan and download the calendar across page reloads.

2. New Tables
   - `conversations` (id, agent, title, created_at, updated_at)
   - `messages` (id, conversation_id, role, content, tool_name, tool_input, created_at)
   - `workout_plans` (id, summary, user_profile, plan_markdown, raw_response, created_at)
   - `calendar_events` (id, workout_plan_id, name, begin, end, description, created_at)

3. Indexes
   - messages(conversation_id), calendar_events(workout_plan_id), calendar_events(begin)

4. Security
   - Single-tenant app, no sign-in. RLS enabled on every table.
   - Policies allow anon + authenticated CRUD on all tables because the data is
     intentionally shared/public within this single-tenant demo app.

5. Important Notes
   1. Single-tenant — no user_id column and no auth.users FK.
   2. Policies scoped TO anon, authenticated so the anon-key frontend can read/write.
   3. Idempotent: IF NOT EXISTS for tables/indexes, DROP POLICY IF EXISTS before recreating.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text NOT NULL CHECK (agent IN ('coach', 'organizer')),
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content text NOT NULL,
  tool_name text,
  tool_input jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  summary text,
  user_profile jsonb,
  plan_markdown text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_workout_plans" ON workout_plans;
CREATE POLICY "anon_select_workout_plans" ON workout_plans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_workout_plans" ON workout_plans;
CREATE POLICY "anon_insert_workout_plans" ON workout_plans FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_workout_plans" ON workout_plans;
CREATE POLICY "anon_update_workout_plans" ON workout_plans FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_workout_plans" ON workout_plans;
CREATE POLICY "anon_delete_workout_plans" ON workout_plans FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  name text NOT NULL,
  begin timestamptz NOT NULL,
  "end" timestamptz NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calendar_events_workout_plan_id_idx ON calendar_events(workout_plan_id);
CREATE INDEX IF NOT EXISTS calendar_events_begin_idx ON calendar_events(begin);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_calendar_events" ON calendar_events;
CREATE POLICY "anon_select_calendar_events" ON calendar_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_calendar_events" ON calendar_events;
CREATE POLICY "anon_insert_calendar_events" ON calendar_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_calendar_events" ON calendar_events;
CREATE POLICY "anon_update_calendar_events" ON calendar_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_calendar_events" ON calendar_events;
CREATE POLICY "anon_delete_calendar_events" ON calendar_events FOR DELETE
  TO anon, authenticated USING (true);
