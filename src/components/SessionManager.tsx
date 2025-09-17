'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Video,
  User,
  Users,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Save,
  Phone,
  Mail,
  Star,
  MessageCircle,
  FileText,
  Download,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';

interface Session {
  id: string;
  participantName: string;
  participantEmail: string;
  participantAvatar: string;
  session_date: string;
  session_time: string;
  duration: number;
  type: 'free' | 'consultation' | 'regular';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetLink?: string;
  notes?: string;
  price?: number;
  topic?: string;
}

interface SessionManagerProps {
  userType: 'student' | 'mentor';
  currentUser: {
    name: string;
    email: string;
  };
}

const SessionManager: React.FC<SessionManagerProps> = ({ userType, currentUser }) => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      participantName: userType === 'student' ? 'Dr. Sarah Kumar' : 'Sarah Chen',
      participantEmail: userType === 'student' ? 'sarah.kumar@university.edu' : 'sarah.chen@student.edu',
      participantAvatar: userType === 'student' ? 'SK' : 'SC',
      session_date: '2025-09-18',
      session_time: '14:00',
      duration: 60,
      type: 'regular',
      status: 'scheduled',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      topic: 'Research Methodology Discussion',
      price: userType === 'mentor' ? 50 : undefined,
      notes: 'Prepare literature review draft for discussion'
    },
    {
      id: '2',
      participantName: userType === 'student' ? 'Prof. Michael Chen' : 'Marcus Rodriguez',
      participantEmail: userType === 'student' ? 'michael.chen@mit.edu' : 'marcus.r@student.edu',
      participantAvatar: userType === 'student' ? 'MC' : 'MR',
      session_date: '2025-09-19',
      session_time: '15:00',
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      topic: 'Data Analysis Techniques',
      price: userType === 'mentor' ? 40 : undefined
    }
  ]);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const generateMeetLink = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${randomId.substring(0, 3)}-${randomId.substring(3, 7)}-${randomId.substring(7, 10)}`;
  };

  const handleJoinSession = (session: Session) => {
    if (session.meetLink) {
      // In a real app, you might want to log this action
      window.open(session.meetLink, '_blank');
      
      // Update session status to ongoing
      setSessions(sessions.map(s => 
        s.id === session.id 
          ? { ...s, status: 'ongoing' as const }
          : s
      ));
    }
  };

  const handleCompleteSession = (sessionId: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, status: 'completed' as const }
        : s
    ));
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, status: 'cancelled' as const }
        : s
    ));
  };

  const handleSaveNotes = (sessionId: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, notes: sessionNotes }
        : s
    ));
    setEditingNotes(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSessionTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'free': return 'bg-amber-100 text-amber-700';
      case 'consultation': return 'bg-purple-100 text-purple-700';
      case 'regular': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const SessionModal = () => (
    <AnimatePresence>
      {showSessionModal && selectedSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSessionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}
                >
                  {selectedSession.participantAvatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSession.participantName}</h3>
                  <p className="text-gray-600">{selectedSession.participantEmail}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                      {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(selectedSession.type)}`}>
                      {selectedSession.type === 'free' ? 'Free Session' : 
                       selectedSession.type === 'consultation' ? 'Consultation' : 'Regular Session'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(selectedSession.session_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{formatTime(selectedSession.session_time)} ({selectedSession.duration} min)</p>
                  </div>
                </div>

                {selectedSession.price && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">${selectedSession.price}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedSession.topic && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Topic</p>
                    <p className="font-medium">{selectedSession.topic}</p>
                  </div>
                )}

                {selectedSession.meetLink && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={selectedSession.meetLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedSession.meetLink!)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session Notes */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Session Notes</h4>
                {userType === 'mentor' && (
                  <button
                    onClick={() => {
                      setEditingNotes(!editingNotes);
                      setSessionNotes(selectedSession.notes || '');
                    }}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg"
                  >
                    {editingNotes ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    <span>{editingNotes ? 'Save' : 'Edit'}</span>
                  </button>
                )}
              </div>
              
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Add session notes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveNotes(selectedSession.id)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      Save Notes
                    </button>
                    <button
                      onClick={() => setEditingNotes(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    {selectedSession.notes || 'No notes added yet.'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {selectedSession.status === 'scheduled' && selectedSession.meetLink && (
                <button
                  onClick={() => handleJoinSession(selectedSession)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-semibold"
                  style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                >
                  <Video className="w-5 h-5" />
                  <span>Join Meeting</span>
                </button>
              )}
              
              {selectedSession.status === 'ongoing' && (
                <button
                  onClick={() => handleCompleteSession(selectedSession.id)}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Complete</span>
                </button>
              )}
              
              {selectedSession.status === 'scheduled' && (
                <button
                  onClick={() => handleCancelSession(selectedSession.id)}
                  className="flex items-center space-x-2 px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-semibold"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel Session</span>
                </button>
              )}
              
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold">
                <MessageCircle className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userType === 'student' ? 'My Sessions' : 'Student Sessions'}
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {sessions.filter(s => s.status === 'scheduled').length} upcoming sessions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => {
              setSelectedSession(session);
              setShowSessionModal(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                >
                  {session.participantAvatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{session.participantName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(session.session_date)} at {formatTime(session.session_time)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.type)}`}>
                      {session.duration} min
                    </span>
                    {session.price && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ${session.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {session.status === 'scheduled' && session.meetLink && (
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinSession(session);
                    }}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-sm font-medium">Join</span>
                  </button>
                )}
                <button 
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle individual actions
                  }}
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {session.topic && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Topic:</span> {session.topic}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <SessionModal />
    </div>
  );
};

export default SessionManager;