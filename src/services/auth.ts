import { supabase, Profile } from '@/lib/supabase'
import { AuthError, User } from '@supabase/supabase-js'

export interface AuthResponse {
  user?: User | null
  profile?: Profile | null
  error?: AuthError | Error | null
}

export interface SignUpData {
  email: string
  password: string
  name: string
  userType: 'student' | 'mentor'
  subjects?: string[]
  hourlyRate?: number
  bio?: string
}

export class AuthService {
  // Sign up new user
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            user_type: data.userType,
            subjects: data.subjects || [],
            hourly_rate: data.hourlyRate || null,
            bio: data.bio || null
          }
        }
      })

      if (authError) {
        return { error: authError }
      }

      // Get the created profile
      if (authData.user) {
        const profile = await this.getProfile(authData.user.id)
        return {
          user: authData.user,
          profile: profile.data,
          error: profile.error
        }
      }

      return { user: authData.user }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return { error: authError }
      }

      // Get user profile
      if (authData.user) {
        const profile = await this.getProfile(authData.user.id)
        
        // If profile doesn't exist, try to create it from auth user data
        if (!profile.data && !profile.error) {
          console.log('No profile found, creating one for existing user...');
          // This can happen if the trigger didn't work properly
          const profileData = {
            id: authData.user.id,
            email: authData.user.email || '',
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
            user_type: authData.user.user_metadata?.user_type || 'student'
          }
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
          
          if (createError) {
            console.warn('Failed to create profile during signin:', createError.message);
          } else {
            return {
              user: authData.user,
              profile: newProfile?.[0] || null,
              error: null
            }
          }
        }
        
        return {
          user: authData.user,
          profile: profile.data,
          error: profile.error
        }
      }

      return { user: authData.user }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign out user
  static async signOut(): Promise<{ error?: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Get current user session
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { error }
      }

      if (user) {
        const profile = await this.getProfile(user.id)
        return {
          user,
          profile: profile.data,
          error: profile.error
        }
      }

      return { user: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get user profile
  static async getProfile(userId: string): Promise<{ data?: Profile | null, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)

      if (error) {
        console.warn('Profile fetch error:', error.message);
        return { error: new Error(error.message) }
      }

      // Return the first profile or null if not found
      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ data?: Profile | null, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) {
        console.warn('Profile update error:', error.message);
        return { error: new Error(error.message) }
      }

      // Return the first updated profile or null
      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null, profile?: Profile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id)
        callback(session.user, profile.data)
      } else {
        callback(null)
      }
    })
  }

  // Check if user is mentor
  static async isMentor(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    return profile.data?.user_type === 'mentor'
  }

  // Check if user is student
  static async isStudent(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    return profile.data?.user_type === 'student'
  }
}