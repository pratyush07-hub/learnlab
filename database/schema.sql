-- LearnLab Database Schema for Supabase
-- Execute these queries in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'RlDabHVrha22KkhHYZfsBK9daWq5hL70LkM9z94lyAzPCcXQBWaOUJARLG2uMpjEHO4pKvj4i87yBbeirOMvmQ==';

-- Create custom types
CREATE TYPE user_type AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'review', 'completed', 'paused');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    user_type user_type NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    language_preference TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentor specific profiles
CREATE TABLE public.mentor_profiles (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    title TEXT, -- Dr., Prof., etc.
    institution TEXT,
    department TEXT,
    specializations TEXT[], -- Array of research areas
    education JSONB, -- Degrees, institutions, years
    experience_years INTEGER,
    hourly_rate DECIMAL(10,2),
    availability_schedule JSONB, -- Weekly schedule
    languages TEXT[],
    certifications JSONB,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_date TIMESTAMPTZ,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student specific profiles
CREATE TABLE public.student_profiles (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    school TEXT,
    grade_level TEXT,
    interests TEXT[],
    research_areas TEXT[],
    goals JSONB,
    parent_email TEXT,
    emergency_contact JSONB,
    learning_style TEXT,
    total_sessions INTEGER DEFAULT 0,
    achievement_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Projects
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id),
    research_area TEXT,
    status project_status DEFAULT 'planning',
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    milestones JSONB,
    resources JSONB,
    progress_percentage INTEGER DEFAULT 0,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship Sessions
CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id) NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status session_status DEFAULT 'scheduled',
    session_type TEXT, -- video, chat, in-person
    meeting_link TEXT,
    session_notes TEXT,
    homework_assigned TEXT,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    student_feedback TEXT,
    mentor_feedback TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages/Chat
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
    session_id UUID REFERENCES public.sessions(id),
    project_id UUID REFERENCES public.projects(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, file, image
    file_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) NOT NULL,
    mentor_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_intent_id TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- session_reminder, message, payment, etc.
    related_id UUID, -- ID of related session, message, etc.
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources/Materials
CREATE TABLE public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- document, video, link, quiz
    file_url TEXT,
    external_url TEXT,
    content JSONB,
    tags TEXT[],
    research_area TEXT,
    difficulty_level TEXT, -- beginner, intermediate, advanced
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews/Ratings
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement/Badges
CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    criteria JSONB,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_sessions_student_id ON public.sessions(student_id);
CREATE INDEX idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX idx_sessions_scheduled_start ON public.sessions(scheduled_start);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_projects_student_id ON public.projects(student_id);
CREATE INDEX idx_projects_mentor_id ON public.projects(mentor_id);

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (can be customized based on requirements)
-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Students can view their own student profile
CREATE POLICY "Students can view own student profile" ON public.student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own student profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);

-- Mentors can view their own mentor profile
CREATE POLICY "Mentors can view own mentor profile" ON public.mentor_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Mentors can update own mentor profile" ON public.mentor_profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON public.mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();