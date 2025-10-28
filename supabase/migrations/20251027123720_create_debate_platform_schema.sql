/*
  # AI-Powered Debate Simulator Platform Schema

  ## Overview
  Creates the complete database schema for the debate simulator and media intelligence platform.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Display name
  - `avatar_url` (text) - Profile picture URL
  - `total_debates` (integer) - Total debates participated
  - `wins` (integer) - Number of wins
  - `total_score` (integer) - Cumulative score
  - `rank` (text) - User rank tier
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. debates
  - `id` (uuid, primary key) - Unique debate identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `topic` (text) - Debate topic
  - `user_score` (integer) - User's score
  - `ai_score` (integer) - AI opponent's score
  - `duration_seconds` (integer) - Debate duration
  - `persona` (text) - AI persona used
  - `status` (text) - completed/ongoing
  - `feedback` (text) - AI-generated feedback
  - `created_at` (timestamptz) - Debate start time
  - `completed_at` (timestamptz) - Debate end time

  ### 3. debate_messages
  - `id` (uuid, primary key) - Message identifier
  - `debate_id` (uuid, foreign key) - References debates.id
  - `sender` (text) - user/ai
  - `content` (text) - Message content
  - `timestamp` (timestamptz) - Message time
  - `score_impact` (integer) - Points awarded for this message

  ### 4. media_analyses
  - `id` (uuid, primary key) - Analysis identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `topic` (text) - Analyzed topic
  - `summary` (text) - Topic summary
  - `pros` (jsonb) - Array of pros arguments
  - `cons` (jsonb) - Array of cons arguments
  - `sentiment_score` (float) - -1 to 1 sentiment
  - `engagement_data` (jsonb) - Chart data
  - `guest_personas` (jsonb) - Recommended personas
  - `created_at` (timestamptz) - Analysis time

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Public read access to leaderboard data

  ## Important Notes
  1. All timestamps use timestamptz for timezone awareness
  2. JSONB fields allow flexible storage of complex data structures
  3. Foreign keys ensure referential integrity
  4. Default values prevent null issues
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text DEFAULT '',
  total_debates integer DEFAULT 0,
  wins integer DEFAULT 0,
  total_score integer DEFAULT 0,
  rank text DEFAULT 'Novice',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create debates table
CREATE TABLE IF NOT EXISTS debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  user_score integer DEFAULT 0,
  ai_score integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  persona text DEFAULT 'Neutral',
  status text DEFAULT 'ongoing',
  feedback text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create debate_messages table
CREATE TABLE IF NOT EXISTS debate_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid REFERENCES debates(id) ON DELETE CASCADE NOT NULL,
  sender text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  score_impact integer DEFAULT 0
);

-- Create media_analyses table
CREATE TABLE IF NOT EXISTS media_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  summary text DEFAULT '',
  pros jsonb DEFAULT '[]'::jsonb,
  cons jsonb DEFAULT '[]'::jsonb,
  sentiment_score float DEFAULT 0,
  engagement_data jsonb DEFAULT '{}'::jsonb,
  guest_personas jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_analyses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Debates policies
CREATE POLICY "Users can view own debates"
  ON debates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debates"
  ON debates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debates"
  ON debates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debates"
  ON debates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Debate messages policies
CREATE POLICY "Users can view messages from own debates"
  ON debate_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = debate_messages.debate_id
      AND debates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own debates"
  ON debate_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = debate_messages.debate_id
      AND debates.user_id = auth.uid()
    )
  );

-- Media analyses policies
CREATE POLICY "Users can view own analyses"
  ON media_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON media_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON media_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON media_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debates_user_id ON debates(user_id);
CREATE INDEX IF NOT EXISTS idx_debates_created_at ON debates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debate_messages_debate_id ON debate_messages(debate_id);
CREATE INDEX IF NOT EXISTS idx_media_analyses_user_id ON media_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON profiles(total_score DESC);