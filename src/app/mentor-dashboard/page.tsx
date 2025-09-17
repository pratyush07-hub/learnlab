'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MentorDashboard from '@/components/MentorDashboard';
import { AuthService } from '@/services/auth';
import { Profile } from '@/lib/supabase';

export default function MentorDashboardPage() {
  const router = useRouter();
  const [mentor, setMentor] = useState<Profile | null>(null);
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

      if (profile.user_type !== 'mentor') {
        // Not a mentor, redirect to student dashboard
        router.push('/student-dashboard');
        return;
      }

      setMentor(profile);
    } catch (error) {
      console.error('Authentication check failed:', error);
      // For development, create a mock mentor
      const mockMentor: Profile = {
        id: 'mock-mentor-1',
        email: 'mentor@learnlab.com',
        name: 'Dr. Sarah Kumar',
        user_type: 'mentor',
        subjects: ['Machine Learning', 'Data Science', 'Research Methods'],
        rating: 4.9,
        hourly_rate: 75,
        total_sessions: 0,
        total_earnings: 0,
        bio: 'Experienced data scientist and machine learning researcher with 8+ years in the field.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setMentor(mockMentor);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-4 animate-pulse"
            style={{ boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}
          ></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be a mentor to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <MentorDashboard mentor={mentor} onLogout={handleLogout} />;
}