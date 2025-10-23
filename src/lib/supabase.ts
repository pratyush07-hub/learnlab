import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Database types
export interface Profile {
  id: string
  email: string
  name: string
  user_type: 'student' | 'mentor'
  avatar_url?: string
  bio?: string
  subjects?: string[]
  rating?: number
  hourly_rate?: number
  total_sessions?: number
  total_earnings?: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  student_id: string
  mentor_id: string
  subject: string
  session_date: string
  session_time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  amount: number
  notes?: string
  meeting_link?: string
  created_at: string
  updated_at: string
  student?: Profile
  mentor?: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface Earning {
  id: string
  mentor_id: string
  session_id: string
  amount: number
  status: 'pending' | 'paid'
  paid_at?: string
  created_at: string
  session?: Session
}

export interface FileRecord {
  id: string
  user_id: string
  name: string
  url: string
  type: string
  size: number
  created_at: string
}

export interface Program {
  id: string
  title: string
  description: string
  price: number
  duration_weeks: number
  session_count: number
  mentor_id?: string // Made optional for admin-created programs
  subjects: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  mentor?: Profile
}

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
  
  return { data: data?.[0] || null, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  
  return { data, error }
}
// Fetch all mentors
export const getAllMentors = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_type', 'mentor')

  if (error) {
    console.error('Error fetching mentors:', error)
    return { data: [], error }
  }

  return { data, error: null }
}
