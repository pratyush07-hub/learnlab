import { supabase } from '@/lib/supabase'

export interface ProgramEnrollment {
  id: string;
  student_id: string;
  program_id: string;
  payment_id: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount_paid: number;
  enrollment_date: string;
  completion_date?: string;
  progress_percentage: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  program?: any;
  student?: any;
}

export class EnrollmentService {
  // Create enrollment after successful payment
  static async createEnrollment(enrollmentData: {
    studentId: string;
    programId: string;
    paymentId: string;
    amountPaid: number;
    paymentStatus?: string;
    notes?: string;
  }): Promise<{ data?: ProgramEnrollment, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .insert({
          student_id: enrollmentData.studentId,
          program_id: enrollmentData.programId,
          payment_id: enrollmentData.paymentId,
          amount_paid: enrollmentData.amountPaid,
          payment_status: enrollmentData.paymentStatus || 'completed',
          notes: enrollmentData.notes,
          enrollment_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          program:programs(*),
          student:profiles(*)
        `)
        .single()

      if (error) {
        console.error('Error creating enrollment:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment }
    } catch (error) {
      console.error('Error creating enrollment:', error);
      return { error: error as Error }
    }
  }

  // Get student's enrollments
  static async getStudentEnrollments(studentId: string): Promise<{ data?: ProgramEnrollment[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false })

      if (error) {
        console.error('Error fetching student enrollments:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment[] }
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
      return { error: error as Error }
    }
  }

  // Get all enrollments (admin)
  static async getAllEnrollments(): Promise<{ data?: ProgramEnrollment[], error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .select(`
          *,
          program:programs(*),
          student:profiles(*)
        `)
        .order('enrollment_date', { ascending: false })

      if (error) {
        console.error('Error fetching all enrollments:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment[] }
    } catch (error) {
      console.error('Error fetching all enrollments:', error);
      return { error: error as Error }
    }
  }

  // Update enrollment progress
  static async updateProgress(enrollmentId: string, progressPercentage: number): Promise<{ data?: ProgramEnrollment, error?: Error | null }> {
    try {
      const updateData: any = {
        progress_percentage: Math.max(0, Math.min(100, progressPercentage)),
        updated_at: new Date().toISOString()
      }

      // If progress is 100%, set completion date
      if (progressPercentage >= 100) {
        updateData.completion_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('program_enrollments')
        .update(updateData)
        .eq('id', enrollmentId)
        .select(`
          *,
          program:programs(*)
        `)
        .single()

      if (error) {
        console.error('Error updating enrollment progress:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment }
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      return { error: error as Error }
    }
  }

  // Update payment status
  static async updatePaymentStatus(enrollmentId: string, paymentStatus: string): Promise<{ data?: ProgramEnrollment, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .select(`
          *,
          program:programs(*)
        `)
        .single()

      if (error) {
        console.error('Error updating payment status:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment }
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { error: error as Error }
    }
  }

  // Check if student is already enrolled in a program
  static async checkEnrollment(studentId: string, programId: string): Promise<{ data?: ProgramEnrollment, error?: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('student_id', studentId)
        .eq('program_id', programId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking enrollment:', error);
        return { error: error as Error }
      }

      return { data: data as ProgramEnrollment || undefined }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return { error: error as Error }
    }
  }

  // Get program statistics
  static async getProgramStats(programId: string): Promise<{ 
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalRevenue: number;
    averageProgress: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('program_enrollments')
        .select('payment_status, progress_percentage, amount_paid, completion_date')
        .eq('program_id', programId)
        .eq('payment_status', 'completed')

      if (error) {
        console.error('Error fetching program stats:', error);
        return {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          totalRevenue: 0,
          averageProgress: 0
        }
      }

      const enrollments = data || []
      const totalEnrollments = enrollments.length
      const completedEnrollments = enrollments.filter(e => e.completion_date).length
      const activeEnrollments = totalEnrollments - completedEnrollments
      const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount_paid || 0), 0)
      const averageProgress = totalEnrollments > 0 
        ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalEnrollments
        : 0

      return {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        totalRevenue,
        averageProgress: Math.round(averageProgress)
      }
    } catch (error) {
      console.error('Error calculating program stats:', error);
      return {
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        totalRevenue: 0,
        averageProgress: 0
      }
    }
  }
}