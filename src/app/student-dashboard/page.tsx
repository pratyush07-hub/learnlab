'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDashboard from '@/components/UserDashboard';
import { AuthService } from '@/services/auth';
import { Profile } from '@/lib/supabase';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { user, profile, error } = await AuthService.getCurrentUser();
      
      if (error || !user || !profile) {
        // Not authenticated, redirect to home
        router.push('/');
        return;
      }

      if (profile.user_type !== 'student') {
        // Not a student, redirect to mentor dashboard
        router.push('/mentor-dashboard');
        return;
      }

      setStudent(profile);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // For development, create a mock student
      const mockStudent: Profile = {
        id: 'mock-student-1',
        email: 'student@learnlab.com',
        name: 'Alex Johnson',
        user_type: 'student',
        total_sessions: 0,
        bio: 'Eager to learn and grow through mentorship.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setStudent(mockStudent);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 animate-pulse"
            style={{ boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
          ></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be a student to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const userForDashboard = {
    id: student.id,
    name: student.name,
    email: student.email,
    avatar: student.avatar_url
  };

  return <UserDashboard user={userForDashboard} onLogout={handleLogout} />;
}