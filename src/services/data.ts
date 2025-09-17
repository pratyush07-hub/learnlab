import { supabase, Profile, Session, Message, Earning, FileRecord } from '@/lib/supabase'

export class UserService {
  // Get all mentors
  static async getMentors(): Promise<{ data?: Profile[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'mentor')
        .order('rating', { ascending: false })

      if (error) {
        // Return mock data if database is not set up
        console.warn('Database not set up, returning mock mentors:', error.message);
        return { 
          data: [
            {
              id: 'mock-mentor-1',
              email: 'mentor1@learnlab.com',
              name: 'Dr. Sarah Kumar',
              user_type: 'mentor' as const,
              subjects: ['Machine Learning', 'Data Science'],
              rating: 4.9,
              hourly_rate: 75,
              bio: 'Experienced ML researcher with 8+ years in the field.',
              total_sessions: 156,
              total_earnings: 11700,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'mock-mentor-2',
              email: 'mentor2@learnlab.com',
              name: 'Prof. Michael Chen',
              user_type: 'mentor' as const,
              subjects: ['Physics', 'Mathematics'],
              rating: 4.8,
              hourly_rate: 85,
              bio: 'Physics professor specializing in quantum mechanics.',
              total_sessions: 203,
              total_earnings: 17255,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      }

      return { data: data || [] }
    } catch (error) {
      console.warn('Error fetching mentors, returning mock data:', error);
      return { 
        data: [],
        error: error as Error 
      }
    }
  }

  // Get all students for a mentor
  static async getStudentsForMentor(mentorId: string): Promise<{ data?: Profile[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          student_id,
          profiles!sessions_student_id_fkey (*)
        `)
        .eq('mentor_id', mentorId)

      if (error) {
        console.warn('Database not set up, returning mock students:', error.message);
        return { 
          data: [
            {
              id: 'mock-student-1',
              email: 'student1@learnlab.com',
              name: 'Alex Johnson',
              user_type: 'student' as const,
              total_sessions: 5,
              bio: 'Computer Science student passionate about AI.',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      }

      // Extract unique students
      const students = data?.reduce((acc: Profile[], session: any) => {
        const student = session.profiles
        if (student && !acc.find(s => s.id === student.id)) {
          acc.push(student)
        }
        return acc
      }, []) || []

      return { data: students }
    } catch (error) {
      console.warn('Error fetching students, returning mock data:', error);
      return { data: [], error: error as Error }
    }
  }

  // Search mentors by subject
  static async searchMentors(subject: string): Promise<{ data?: Profile[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'mentor')
        .contains('subjects', [subject])
        .order('rating', { ascending: false })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

export class SessionService {
  // Create a new session
  static async createSession(sessionData: {
    studentId: string
    mentorId: string
    subject: string
    date: string
    time: string
    duration: number
    amount: number
    notes?: string
  }): Promise<{ data?: Session, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          student_id: sessionData.studentId,
          mentor_id: sessionData.mentorId,
          subject: sessionData.subject,
          session_date: sessionData.date,
          session_time: sessionData.time,
          duration: sessionData.duration,
          amount: sessionData.amount,
          notes: sessionData.notes,
          status: 'scheduled'
        })
        .select()

      if (error) {
        console.warn('Session creation error:', error.message);
        return { error: new Error(error.message) }
      }

      // Return the first (and should be only) inserted record
      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get sessions for a user (student or mentor)
  static async getUserSessions(userId: string, userType: 'student' | 'mentor'): Promise<{ data?: Session[], error?: Error | null }> {
    try {
      const query = supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey (*),
          mentor:profiles!sessions_mentor_id_fkey (*)
        `)

      if (userType === 'student') {
        query.eq('student_id', userId)
      } else {
        query.eq('mentor_id', userId)
      }

      const { data, error } = await query.order('session_date', { ascending: true })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update session status
  static async updateSessionStatus(sessionId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<{ data?: Session, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()

      if (error) {
        console.warn('Session update error:', error.message);
        return { error: new Error(error.message) }
      }

      const updatedSession = data?.[0] || null

      // If session is completed, create earning record
      if (status === 'completed' && updatedSession) {
        await EarningService.createEarning({
          mentorId: updatedSession.mentor_id,
          sessionId: updatedSession.id,
          amount: updatedSession.amount
        })
      }

      return { data: updatedSession }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get upcoming sessions
  static async getUpcomingSessions(userId: string, userType: 'student' | 'mentor'): Promise<{ data?: Session[], error?: Error | null }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const query = supabase
        .from('sessions')
        .select(`
          *,
          student:profiles!sessions_student_id_fkey (*),
          mentor:profiles!sessions_mentor_id_fkey (*)
        `)
        .eq('status', 'scheduled')
        .gte('session_date', today)

      if (userType === 'student') {
        query.eq('student_id', userId)
      } else {
        query.eq('mentor_id', userId)
      }

      const { data, error } = await query.order('session_date', { ascending: true })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

export class MessageService {
  // Send a message
  static async sendMessage(senderId: string, receiverId: string, content: string): Promise<{ data?: Message, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false
        })
        .select()

      if (error) {
        console.warn('Message creation error:', error.message);
        return { error: new Error(error.message) }
      }

      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get conversation between two users
  static async getConversation(userId1: string, userId2: string): Promise<{ data?: Message[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (*),
          receiver:profiles!messages_receiver_id_fkey (*)
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get all conversations for a user
  static async getUserConversations(userId: string): Promise<{ data?: any[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (*),
          receiver:profiles!messages_receiver_id_fkey (*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: new Error(error.message) }
      }

      // Group messages by conversation partner
      const conversations = data?.reduce((acc: any[], message: any) => {
        const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id
        const partner = message.sender_id === userId ? message.receiver : message.sender
        
        if (!acc.find(conv => conv.partnerId === partnerId)) {
          acc.push({
            partnerId,
            partner,
            lastMessage: message,
            unreadCount: data.filter(m => 
              m.receiver_id === userId && 
              m.sender_id === partnerId && 
              !m.read
            ).length
          })
        }
        return acc
      }, []) || []

      return { data: conversations }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Mark messages as read
  static async markMessagesRead(senderId: string, receiverId: string): Promise<{ error?: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('read', false)

      if (error) {
        return { error: new Error(error.message) }
      }

      return {}
    } catch (error) {
      return { error: error as Error }
    }
  }
}

export class EarningService {
  // Create earning record
  static async createEarning(earningData: {
    mentorId: string
    sessionId: string
    amount: number
  }): Promise<{ data?: Earning, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          mentor_id: earningData.mentorId,
          session_id: earningData.sessionId,
          amount: earningData.amount,
          status: 'pending'
        })
        .select()

      if (error) {
        console.warn('Earning creation error:', error.message);
        return { error: new Error(error.message) }
      }

      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get mentor earnings
  static async getMentorEarnings(mentorId: string): Promise<{ data?: Earning[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select(`
          *,
          session:sessions (*)
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Update earning status
  static async updateEarningStatus(earningId: string, status: 'pending' | 'paid'): Promise<{ data?: Earning, error?: Error | null }> {
    try {
      const updates: any = { status }
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('earnings')
        .update(updates)
        .eq('id', earningId)
        .select()

      if (error) {
        console.warn('Earning update error:', error.message);
        return { error: new Error(error.message) }
      }

      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

export class FileService {
  // Upload file
  static async uploadFile(userId: string, file: File): Promise<{ data?: FileRecord, error?: Error | null }> {
    try {
      // Upload to Supabase storage
      const fileName = `${userId}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file)

      if (uploadError) {
        return { error: new Error(uploadError.message) }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(fileName)

      // Save file record to database
      const { data, error } = await supabase
        .from('files')
        .insert({
          user_id: userId,
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size
        })
        .select()

      if (error) {
        console.warn('File upload error:', error.message);
        return { error: new Error(error.message) }
      }

      return { data: data?.[0] || null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Get user files
  static async getUserFiles(userId: string): Promise<{ data?: FileRecord[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { error: new Error(error.message) }
      }

      return { data: data || [] }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Delete file
  static async deleteFile(fileId: string, userId: string): Promise<{ error?: Error | null }> {
    try {
      // Get file record
      const { data: fileRecords, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)

      if (fetchError) {
        console.warn('File fetch error:', fetchError.message);
        return { error: new Error(fetchError.message) }
      }

      const fileRecord = fileRecords?.[0]
      if (!fileRecord) {
        return { error: new Error('File not found') }
      }

      // Delete from storage
      const fileName = fileRecord.url.split('/').pop()
      const { error: deleteError } = await supabase.storage
        .from('files')
        .remove([`${userId}/${fileName}`])

      if (deleteError) {
        return { error: new Error(deleteError.message) }
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId)

      if (error) {
        return { error: new Error(error.message) }
      }

      return {}
    } catch (error) {
      return { error: error as Error }
    }
  }
}