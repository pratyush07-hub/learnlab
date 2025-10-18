'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseService } from '@/services/courses';
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  DollarSign, 
  Clock, 
  FileText, 
  Settings,
  BarChart3,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Send,
  Upload,
  Download,
  Eye,
  Edit,
  LogOut,
  Bell
} from 'lucide-react';

import { AuthService } from '@/services/auth';
import { UserService, SessionService, MessageService, EarningService, FileService } from '@/services/data';
import { Profile, Session as SessionType, Message as MessageType, Earning, FileRecord } from '@/lib/supabase';

interface MentorDashboardProps {
  mentor: Profile;
  onLogout: () => void;
}
type Level = 'beginner' | 'intermediate' | 'advanced';

interface ProgramForm {
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  session_count: number;
  subjects: string[];
  level: Level;
}
export default function MentorDashboard({ mentor, onLogout }: MentorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [form, setForm] = useState<ProgramForm>({
    title: '',
    description: '',
    price: 0,
    duration_weeks: 4,
    session_count: 8,
    subjects: [''],
    level: 'beginner'
  });
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  const [creatingProgram, setCreatingProgram] = useState(false);
  const loadData = async () => {
    setLoading(true);
    try {
      // Load mentor's students
      const studentsResult = await UserService.getStudentsForMentor(mentor.id);
      if (studentsResult.data) {
        setStudents(studentsResult.data);
      }

      // Load mentor's sessions
      const sessionsResult = await SessionService.getUserSessions(mentor.id, 'mentor');
      if (sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      // Load conversations
      const conversationsResult = await MessageService.getUserConversations(mentor.id);
      if (conversationsResult.data) {
        setConversations(conversationsResult.data);
      }

      // Load earnings
      const earningsResult = await EarningService.getMentorEarnings(mentor.id);
      if (earningsResult.data) {
        setEarnings(earningsResult.data);
      }

      // Load files
      const filesResult = await FileService.getUserFiles(mentor.id);
      if (filesResult.data) {
        setFiles(filesResult.data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleSessionStatusUpdate = async (sessionId: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const result = await SessionService.updateSessionStatus(sessionId, status);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Refresh sessions and earnings
      const sessionsResult = await SessionService.getUserSessions(mentor.id, 'mentor');
      if (sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      if (status === 'completed') {
        const earningsResult = await EarningService.getMentorEarnings(mentor.id);
        if (earningsResult.data) {
          setEarnings(earningsResult.data);
        }
      }
    } catch (err) {
      setError('Failed to update session');
      console.error('Error updating session:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const result = await MessageService.sendMessage(mentor.id, selectedConversation.partnerId, newMessage);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setNewMessage('');
      // Refresh conversations
      const conversationsResult = await MessageService.getUserConversations(mentor.id);
      if (conversationsResult.data) {
        setConversations(conversationsResult.data);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await FileService.uploadFile(mentor.id, file);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Refresh files
      const filesResult = await FileService.getUserFiles(mentor.id);
      if (filesResult.data) {
        setFiles(filesResult.data);
      }
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      onLogout();
    } catch (err) {
      console.error('Error signing out:', err);
      onLogout(); // Sign out anyway
    }
  };
   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'level') setForm({ ...form, level: value as Level });
    else if (['price', 'duration_weeks', 'session_count'].includes(name)) setForm({ ...form, [name]: Number(value) });
    else setForm({ ...form, [name]: value });
  };

  const handleSubjectChange = (i: number, value: string) => {
    const updated = [...form.subjects];
    updated[i] = value;
    setForm({ ...form, subjects: updated });
  };

  const addSubjectField = () => setForm({ ...form, subjects: [...form.subjects, ''] });
  const removeSubjectField = (i: number) => setForm({ ...form, subjects: form.subjects.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProgram(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects.filter(s => s.trim() !== ''),
      };
      const { error } = await CourseService.createCourse(payload);
      if (error) alert('Error: ' + error.message);
      else {
        alert('Program created successfully!');
        setActiveTab('overview');
        loadData();
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
    setCreatingProgram(false);
  };
  // Calculate statistics
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.amount, 0);
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.session_date) >= new Date()).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">LearnLab</h1>
              <span className="ml-4 text-gray-600">Mentor Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{mentor.name}</p>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'availability', label: 'Availability', icon: Clock },
              { id: 'files', label: 'Files', icon: FileText },
              { id: 'addCourse', label: 'Add Course', icon: Plus },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right">
              <X size={16} />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                      <p className="text-gray-600">Total Students</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{upcomingSessions}</p>
                      <p className="text-gray-600">Upcoming Sessions</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Calendar className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
                      <p className="text-gray-600">Total Earnings</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mentor.rating || 4.8}</p>
                      <p className="text-gray-600">Average Rating</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Star className="text-yellow-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="premium-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                  {sessions.slice(0, 5).length > 0 ? (
                    <div className="space-y-4">
                      {sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{session.subject}</p>
                            <p className="text-sm text-gray-600">
                              with {session.student?.name} • {new Date(session.session_date).toLocaleDateString()} at {session.session_time}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No sessions yet</p>
                  )}
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-gray-700">Total Earnings</span>
                      <span className="font-semibold text-green-700">₹{totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                      <span className="text-gray-700">Pending</span>
                      <span className="font-semibold text-yellow-700">₹{pendingEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-gray-700">Completed Sessions</span>
                      <span className="font-semibold text-blue-700">{completedSessions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="premium-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Students</h3>
                {students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Sessions: {sessions.filter(s => s.student_id === student.id).length}
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed: {sessions.filter(s => s.student_id === student.id && s.status === 'completed').length}
                          </p>
                        </div>

                        <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Students will appear here when they book sessions with you</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="premium-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Sessions</h3>
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {session.student?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.subject}</p>
                              <p className="text-sm text-gray-600">
                                with {session.student?.name} • {new Date(session.session_date).toLocaleDateString()} at {session.session_time}
                              </p>
                              <p className="text-sm text-gray-500">Duration: {session.duration} minutes</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {session.status}
                          </span>
                          
                          <span className="text-sm font-medium text-gray-900">₹{session.amount}</span>
                          
                          {session.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSessionStatusUpdate(session.id, 'completed')}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleSessionStatusUpdate(session.id, 'cancelled')}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Sessions will appear here when students book with you</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <div className="premium-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h3>
                  {conversations.length > 0 ? (
                    <div className="space-y-3">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.partnerId}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.partnerId === conversation.partnerId
                              ? 'bg-amber-100'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                              {conversation.partner.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{conversation.partner.name}</p>
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No conversations yet</p>
                  )}
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2 premium-card p-6 rounded-2xl">
                  {selectedConversation ? (
                    <div className="h-96 flex flex-col">
                      <div className="flex items-center space-x-3 pb-4 border-b">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {selectedConversation.partner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedConversation.partner.name}</p>
                          <p className="text-sm text-gray-600">{selectedConversation.partner.user_type}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto py-4">
                        <p className="text-center text-gray-500 text-sm">Chat history will load here</p>
                      </div>

                      <div className="flex space-x-2 pt-4 border-t">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                        <p className="mt-1 text-sm text-gray-500">Choose a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
                      <p className="text-gray-600">Total Earnings</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{pendingEarnings.toFixed(2)}</p>
                      <p className="text-gray-600">Pending</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="text-yellow-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{(totalEarnings - pendingEarnings).toFixed(2)}</p>
                      <p className="text-gray-600">Paid</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CheckCircle className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings History</h3>
                {earnings.length > 0 ? (
                  <div className="space-y-4">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Session Payment</p>
                          <p className="text-sm text-gray-600">
                            {earning.session ? `${earning.session.subject} session` : 'Session details'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(earning.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{earning.amount.toFixed(2)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            earning.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {earning.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Complete sessions to start earning</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="premium-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Availability</h3>
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Availability Management</h3>
                  <p className="mt-1 text-sm text-gray-500">Feature coming soon - manage your weekly schedule and availability</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="premium-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Files</h3>
                  <label className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors cursor-pointer">
                    <Upload size={16} className="inline mr-2" />
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-100 rounded">
                              <FileText size={20} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              <p className="text-xs text-gray-500">
                                {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload resources to share with your students</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'addCourse' && (
            <motion.div key="addCourse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form className="bg-white p-6 rounded-xl shadow space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Duration (weeks)</label>
                    <input
                      type="number"
                      name="duration_weeks"
                      value={form.duration_weeks}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Number of Sessions</label>
                    <input
                      type="number"
                      name="session_count"
                      value={form.session_count}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Level</label>
                    <select name="level" value={form.level} onChange={handleChange} className="w-full border rounded-lg p-2">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Subjects</label>
                  {form.subjects.map((subj, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={subj}
                        onChange={e => handleSubjectChange(idx, e.target.value)}
                        className="flex-1 border rounded-lg p-2"
                        required
                      />
                      <button type="button" onClick={() => removeSubjectField(idx)} className="text-red-500">
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addSubjectField} className="px-3 py-1 bg-green-600 text-white rounded-lg">
                    Add Subject
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={creatingProgram}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold hover:from-amber-600 hover:to-amber-800 transition shadow-lg"
                >
                  {creatingProgram ? 'Creating...' : 'Create Program'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}