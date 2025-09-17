'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple test - just set a mock user
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      id: 'test-1'
    };
    setUser(mockUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('learnlab_user');
    localStorage.removeItem('learnlab_user_type');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data found. Please log in again.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Logout
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
                <p className="text-3xl font-bold">12</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Active Programs</h3>
                <p className="text-3xl font-bold">2</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Mentors Connected</h3>
                <p className="text-3xl font-bold">5</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-left transition-colors">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg mb-2"></div>
                  <h3 className="font-semibold text-gray-900">Find Mentors</h3>
                  <p className="text-sm text-gray-600">Browse available mentors</p>
                </button>
                
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2"></div>
                  <h3 className="font-semibold text-gray-900">My Sessions</h3>
                  <p className="text-sm text-gray-600">View upcoming sessions</p>
                </button>
                
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-colors">
                  <div className="w-8 h-8 bg-green-500 rounded-lg mb-2"></div>
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-600">Chat with mentors</p>
                </button>
                
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg mb-2"></div>
                  <h3 className="font-semibold text-gray-900">Programs</h3>
                  <p className="text-sm text-gray-600">View programs</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}