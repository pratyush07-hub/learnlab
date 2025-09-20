-- LearnLab Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS program_enrollments CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) >= 2), -- Name must be at least 2 characters
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'mentor')),
  avatar_url TEXT,
  bio TEXT,
  subjects TEXT[], -- Array of subjects for mentors
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5), -- Rating between 0 and 5
  hourly_rate DECIMAL(10,2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0), -- For mentors, must be non-negative
  total_sessions INTEGER DEFAULT 0 CHECK (total_sessions >= 0),
  total_earnings DECIMAL(10,2) DEFAULT 0 CHECK (total_earnings >= 0), -- For mentors
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
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes, must be positive
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0), -- amount must be non-negative
  notes TEXT,
  meeting_link TEXT, -- Google Meet or other video call link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure student and mentor are different
  CONSTRAINT sessions_different_participants CHECK (student_id != mentor_id),
  -- Ensure session is scheduled in the future (can be disabled for historical data)
  CONSTRAINT sessions_future_date CHECK (session_date >= CURRENT_DATE OR status != 'scheduled')
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 5000), -- Message length limits
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure sender and receiver are different
  CONSTRAINT messages_different_users CHECK (sender_id != receiver_id)
);

-- Earnings table
CREATE TABLE earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0), -- Amount must be non-negative
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure unique earning record per session
  UNIQUE(session_id),
  -- Ensure paid_at is set when status is 'paid'
  CONSTRAINT earnings_paid_at_check CHECK (
    (status = 'paid' AND paid_at IS NOT NULL) OR 
    (status = 'pending' AND paid_at IS NULL)
  )
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0), -- File name cannot be empty
  url TEXT NOT NULL CHECK (LENGTH(url) > 0), -- URL cannot be empty
  type TEXT NOT NULL CHECK (LENGTH(type) > 0), -- File type cannot be empty
  size INTEGER NOT NULL CHECK (size > 0 AND size <= 104857600), -- Max 100MB file size
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL CHECK (LENGTH(title) >= 3), -- Title must be at least 3 characters
  description TEXT NOT NULL CHECK (LENGTH(description) >= 10), -- Description must be at least 10 characters
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- Price must be non-negative
  duration_weeks INTEGER NOT NULL CHECK (duration_weeks > 0 AND duration_weeks <= 104), -- 1-104 weeks (2 years max)
  session_count INTEGER NOT NULL CHECK (session_count > 0 AND session_count <= 1000), -- Reasonable session limit
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subjects TEXT[] NOT NULL CHECK (array_length(subjects, 1) > 0), -- At least one subject required
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program enrollments table
CREATE TABLE program_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  payment_id TEXT NOT NULL, -- Razorpay payment ID
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure unique enrollment per student per program
  UNIQUE(student_id, program_id)
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_earnings_mentor_id ON earnings(mentor_id);
CREATE INDEX idx_earnings_status ON earnings(status);
CREATE INDEX idx_earnings_session_id ON earnings(session_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_type ON files(type);
CREATE INDEX idx_programs_mentor_id ON programs(mentor_id);
CREATE INDEX idx_programs_is_active ON programs(is_active);
CREATE INDEX idx_programs_level ON programs(level);
CREATE INDEX idx_program_enrollments_student_id ON program_enrollments(student_id);
CREATE INDEX idx_program_enrollments_program_id ON program_enrollments(program_id);
CREATE INDEX idx_program_enrollments_payment_status ON program_enrollments(payment_status);
CREATE INDEX idx_program_enrollments_enrollment_date ON program_enrollments(enrollment_date);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Admin bypass policy for profiles (allows full access for administrative functions)
CREATE POLICY "Admin full access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

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
-- Admin bypass policy for sessions (allows full access for administrative functions)
CREATE POLICY "Admin full access to sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

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
-- Admin bypass policy for messages
CREATE POLICY "Admin full access to messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Earnings policies
CREATE POLICY "Mentors can view their earnings" ON earnings FOR SELECT USING (
  auth.uid() = mentor_id
);
CREATE POLICY "System can create earnings" ON earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update earnings" ON earnings FOR UPDATE USING (true);
-- Admin bypass policy for earnings
CREATE POLICY "Admin full access to earnings" ON earnings FOR ALL USING (true) WITH CHECK (true);

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
-- Admin bypass policy for files
CREATE POLICY "Admin full access to files" ON files FOR ALL USING (true) WITH CHECK (true);

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
-- Admin bypass policy for programs (allows full access for administrative functions)
CREATE POLICY "Admin full access to programs" ON programs FOR ALL USING (true) WITH CHECK (true);

-- Program enrollments policies
CREATE POLICY "Students can view their enrollments" ON program_enrollments FOR SELECT USING (
  auth.uid() = student_id
);
CREATE POLICY "Students can create enrollments" ON program_enrollments FOR INSERT WITH CHECK (
  auth.uid() = student_id
);
CREATE POLICY "Students can update their enrollments" ON program_enrollments FOR UPDATE USING (
  auth.uid() = student_id
);
-- Admin bypass policy for enrollments
CREATE POLICY "Admin full access to enrollments" ON program_enrollments FOR ALL USING (true) WITH CHECK (true);

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

CREATE TRIGGER update_program_enrollments_updated_at BEFORE UPDATE ON program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup (create or replace to avoid conflicts)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')), 
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    user_type = COALESCE(EXCLUDED.user_type, profiles.user_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure user exists in profiles (for admin operations)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID, user_email TEXT, user_name TEXT, user_type TEXT)
RETURNS UUID AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (user_id, user_email, user_name, user_type)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type;
  RETURN user_id;
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

-- Sample data setup instructions
-- NOTE: Before inserting sample data, you need to create corresponding auth.users entries
-- You can do this through Supabase Auth or by using the following approach:

-- To create sample users for testing, run these commands in your application:
-- 1. Use Supabase Auth to create users with emails: student@example.com, mentor@example.com, mentor2@example.com
-- 2. The handle_new_user() trigger will automatically create profile entries
-- 3. Then update the profiles with additional data using the functions below

-- Function to create sample data (call after real users are authenticated)
CREATE OR REPLACE FUNCTION create_sample_data()
RETURNS void AS $$
BEGIN
  -- This function should be called after real auth users are created
  -- It will update existing profiles with sample data
  
  -- Update student profile if exists
  UPDATE profiles 
  SET bio = 'I am a student looking to learn new skills.',
      updated_at = NOW()
  WHERE email = 'student@example.com' AND user_type = 'student';
  
  -- Update mentor profiles if they exist
  UPDATE profiles 
  SET 
    bio = 'I am an experienced mentor in mathematics and programming.',
    subjects = ARRAY['Mathematics', 'Programming', 'Computer Science'],
    hourly_rate = 50.00,
    rating = 4.8,
    updated_at = NOW()
  WHERE email = 'mentor@example.com' AND user_type = 'mentor';
  
  UPDATE profiles 
  SET 
    bio = 'Professional tutor with 10+ years of experience.',
    subjects = ARRAY['Physics', 'Chemistry', 'Biology'],
    hourly_rate = 45.00,
    rating = 4.9,
    updated_at = NOW()
  WHERE email = 'mentor2@example.com' AND user_type = 'mentor';
  
  RAISE NOTICE 'Sample data updated successfully. Make sure to create auth users first.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To use the sample data:
-- 1. Create auth users through your application signup
-- 2. Call: SELECT create_sample_data();
-- 3. The profiles will be updated with sample information