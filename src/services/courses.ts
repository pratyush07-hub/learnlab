import { supabase } from '@/lib/supabase'
export interface Course {
  title: string
  description: string
  price?: number
  duration_weeks?: number
  session_count?: number
  subjects?: string[]
  level?: string
}

export class CourseService {
  static async createCourse(courseData: Course) {
    return await supabase.from('courses').insert([courseData]).select()
  }

  static async getAllCourses() {
    return await supabase
      .from('courses')
      .select('*, mentor:profiles!courses_mentor_id_fkey(*)')
      .order('created_at', { ascending: false })
  }
}