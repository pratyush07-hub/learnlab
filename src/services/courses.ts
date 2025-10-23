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
    // First check if the user is authenticated
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Then check if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.email !== 'admin@skillorbitx.com') {
      return { error: new Error('Only admin can create courses') };
    }

    // If all checks pass, create the course
    return await supabase
      .from('courses')
      .insert([{
        ...courseData,
      }])
      .select();
  }

  static async getAllCourses() {
    // First check if the user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    // Then check if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.email !== 'admin@skillorbitx.com') {
      return { error: new Error('Only admin can view courses') };
    }

    // If all checks pass, get all courses
    const { data, error } = await supabase
      .from('courses')
      .select('*');
    
    console.log('Fetched courses:', data); // Debug log
    
    if (error) {
      console.error('Error fetching courses:', error); // Debug log
      return { error };
    }
    
    return { data, error: null };
  }

  static async updateCourse(title: string, courseData: Course) {
    return await supabase
      .from('courses')
      .update(courseData)
      .eq('title', title)
      .select();
  }

  static async deleteCourse(title: string) {
    return await supabase
      .from('courses')
      .delete()
      .eq('title', title)
  }
}