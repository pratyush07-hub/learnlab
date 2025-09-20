-- LearnLab Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'mentor')),
  avatar_url TEXT,
  bio TEXT,
  subjects TEXT[], -- Array of subjects for mentors
  rating DECIMAL(3,2) DEFAULT 0,
  hourly_rate DECIMAL(10,2), -- For mentors
  total_sessions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0, -- For mentors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  meeting_link TEXT, -- Google Meet or other video call link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earnings table
CREATE TABLE earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  session_count INTEGER NOT NULL,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subjects TEXT[], -- Array of subjects covered
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_earnings_mentor_id ON earnings(mentor_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_programs_mentor_id ON programs(mentor_id);
CREATE INDEX idx_programs_is_active ON programs(is_active);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON sessions FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = mentor_id
);
CREATE POLICY "Students can create sessions" ON sessions FOR INSERT WITH CHECK (
  auth.uid() = student_id
);
CREATE POLICY "Session participants can update sessions" ON sessions FOR UPDATE USING (
  auth.uid() = student_id OR auth.uid() = mentor_id
);

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY "Users can update their received messages" ON messages FOR UPDATE USING (
  auth.uid() = receiver_id
);

-- Earnings policies
CREATE POLICY "Mentors can view their earnings" ON earnings FOR SELECT USING (
  auth.uid() = mentor_id
);
CREATE POLICY "System can create earnings" ON earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update earnings" ON earnings FOR UPDATE USING (true);

-- Files policies
CREATE POLICY "Users can view their files" ON files FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can upload files" ON files FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "Users can update their files" ON files FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can delete their files" ON files FOR DELETE USING (
  auth.uid() = user_id
);

-- Programs policies
CREATE POLICY "Users can view active programs" ON programs FOR SELECT USING (
  is_active = true
);
CREATE POLICY "Mentors can view their programs" ON programs FOR SELECT USING (
  auth.uid() = mentor_id
);
CREATE POLICY "Mentors can create programs" ON programs FOR INSERT WITH CHECK (
  auth.uid() = mentor_id
);
CREATE POLICY "Mentors can update their programs" ON programs FOR UPDATE USING (
  auth.uid() = mentor_id
);
CREATE POLICY "Mentors can delete their programs" ON programs FOR DELETE USING (
  auth.uid() = mentor_id
);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup (create or replace to avoid conflicts)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (only create if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;