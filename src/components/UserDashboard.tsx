'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Video, 
  FileText, 
  Clock, 
  Star, 
  Search,
  Filter,
  Upload,
  Send,
  Phone,
  Mail,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Download,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

import { AuthService } from '@/services/auth';
import { UserService, SessionService, MessageService, FileService } from '@/services/data';
import { Profile, Session as SessionType, Message as MessageType, FileRecord } from '@/lib/supabase';

interface UserDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
}

interface BookingData {
  mentorId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [bookingData, setBookingData] = useState<BookingData>({
    mentorId: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load mentors
      const mentorsResult = await UserService.getMentors();
      if (mentorsResult.data) {
        setMentors(mentorsResult.data);
      }

      // Load user sessions
      const sessionsResult = await SessionService.getUserSessions(user.id, 'student');
      if (sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      // Load conversations
      const conversationsResult = await MessageService.getUserConversations(user.id);
      if (conversationsResult.data) {
        setConversations(conversationsResult.data);
      }

      // Load files
      const filesResult = await FileService.getUserFiles(user.id);
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

  const handleBookSession = async () => {
    if (!selectedMentor || !bookingData.date || !bookingData.time || !bookingData.subject) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const amount = (selectedMentor.hourly_rate || 50) * (bookingData.duration / 60);
      
      const result = await SessionService.createSession({
        studentId: user.id,
        mentorId: bookingData.mentorId,
        subject: bookingData.subject,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        amount,
        notes: bookingData.notes
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Refresh sessions
      const sessionsResult = await SessionService.getUserSessions(user.id, 'student');
      if (sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      // Reset form
      setSelectedMentor(null);
      setBookingData({
        mentorId: '',
        subject: '',
        date: '',
        time: '',
        duration: 60,
        notes: ''
      });
      setActiveTab('sessions');
      setError('');
    } catch (err) {
      setError('Failed to book session');
      console.error('Error booking session:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const result = await MessageService.sendMessage(user.id, selectedConversation.partnerId, newMessage);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      setNewMessage('');
      // Refresh conversations
      const conversationsResult = await MessageService.getUserConversations(user.id);
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
      const result = await FileService.uploadFile(user.id, file);
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Refresh files
      const filesResult = await FileService.getUserFiles(user.id);
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

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || 
                          mentor.subjects?.includes(selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && new Date(session.date) >= new Date()
  );

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
              <span className="ml-4 text-gray-600">Student Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || ''}</p>
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
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'mentors', label: 'Find Mentors', icon: Users },
              { id: 'sessions', label: 'My Sessions', icon: Calendar },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'files', label: 'Files', icon: FileText }
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                      <p className="text-gray-600">Total Sessions</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                      <p className="text-gray-600">Upcoming Sessions</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Clock className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                      <p className="text-gray-600">Active Chats</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <MessageCircle className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="premium-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                {sessions.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{session.subject}</p>
                          <p className="text-sm text-gray-600">
                            with {session.mentor?.name} • {new Date(session.date).toLocaleDateString()} at {session.time}
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
                  <p className="text-gray-600">No sessions yet. Book your first session!</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Find Mentors Tab */}
          {activeTab === 'mentors' && (
            <motion.div
              key="mentors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="premium-card p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search mentors by name, expertise, or bio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
              </div>

              {/* Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div key={mentor.id} className="premium-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-sm text-gray-600">{mentor.rating || 4.8}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mentor.subjects?.slice(0, 3).map((subject, index) => (
                          <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        ${mentor.hourly_rate || 50}/hr
                      </span>
                      <button
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setBookingData(prev => ({ ...prev, mentorId: mentor.id }));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))}
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                              {session.mentor?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.subject}</p>
                              <p className="text-sm text-gray-600">
                                with {session.mentor?.name} • {new Date(session.date).toLocaleDateString()} at {session.time}
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
                          <span className="text-sm font-medium text-gray-900">${session.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Book your first session with a mentor!</p>
                    <button
                      onClick={() => setActiveTab('mentors')}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                    >
                      Find Mentors
                    </button>
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
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
                    <p className="mt-1 text-sm text-gray-500">Upload your first file to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Booking Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card p-6 rounded-2xl max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Book Session</h3>
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={bookingData.subject}
                  onChange={(e) => setBookingData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Calculus, Physics, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  value={bookingData.duration}
                  onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific topics or requirements..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Cost: <span className="font-semibold">${((selectedMentor.hourly_rate || 50) * (bookingData.duration / 60)).toFixed(2)}</span>
                </p>
              </div>

              <button
                onClick={handleBookSession}
                className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
              >
                Book Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}