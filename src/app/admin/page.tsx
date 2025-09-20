'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/services/auth'
import { UserService, SessionService } from '@/services/data'
import { ProgramService } from '@/services/programs'
import { Profile, Session, Program } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<Profile[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<'all' | 'student' | 'mentor'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')
  const [programSearchTerm, setProgramSearchTerm] = useState('')
  const [selectedProgramStatus, setSelectedProgramStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // User Management States
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null)
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    user_type: 'student' as 'student' | 'mentor',
    bio: '',
    subjects: [] as string[],
    hourly_rate: 0
  })
  const [formLoading, setFormLoading] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  // Session Management States
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionForm, setSessionForm] = useState({
    student_id: '',
    mentor_id: '',
    subject: '',
    session_date: '',
    session_time: '',
    duration: 60,
    amount: 0,
    notes: '',
    meeting_link: ''
  })

  // Program Management States
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [showDeleteProgramConfirm, setShowDeleteProgramConfirm] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null)
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    price: 0,
    duration_weeks: 4,
    session_count: 8,
    subjects: [''],
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    is_active: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await AuthService.getCurrentUser()
      
      if (!user) {
        setShowLogin(true)
        setIsLoading(false)
        return
      }
      
      if (user.email !== 'admin@skillorbitx.com') {
        setLoginError('Access denied. Admin privileges required.')
        setShowLogin(true)
        setIsLoading(false)
        return
      }
      
      setCurrentUser(user)
      setShowLogin(false)
      await loadDashboardData()
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      // First try to sign in
      let { user, error } = await AuthService.signIn(loginEmail, loginPassword)
      
      // If user doesn't exist and we're trying to login as admin, create the admin user
      if (error && loginEmail === 'admin@skillorbitx.com' && loginPassword === 'GeetaKaSaar_3568') {
        console.log('Admin user not found, creating admin account...')
        
        const signupResult = await AuthService.signUp({
          email: 'admin@skillorbitx.com',
          password: 'GeetaKaSaar_3568',
          name: 'Admin User',
          userType: 'mentor' // Using mentor type for admin privileges
        })

        if (signupResult.error) {
          setLoginError('Failed to create admin account: ' + signupResult.error.message)
          setLoginLoading(false)
          return
        }

        // Now try to sign in again
        const loginResult = await AuthService.signIn(loginEmail, loginPassword)
        user = loginResult.user
        error = loginResult.error
      }
      
      if (error) {
        setLoginError(error.message || 'Login failed')
        setLoginLoading(false)
        return
      }

      if (!user || user.email !== 'admin@skillorbitx.com') {
        setLoginError('Access denied. Admin privileges required.')
        setLoginLoading(false)
        return
      }

      setCurrentUser(user)
      setShowLogin(false)
      await loadDashboardData()
      setLoginLoading(false)
    } catch (error) {
      setLoginError('An error occurred during login')
      setLoginLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      const [usersResult, sessionsResult, programsResult] = await Promise.all([
        UserService.getAllUsers(),
        SessionService.getAllSessions(),
        ProgramService.getAllPrograms()
      ])
      
      setUsers(usersResult.data || [])
      setSessions(sessionsResult.data || [])
      setPrograms(programsResult.data || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // User Management Functions
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user)
    setEditUserForm({
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      bio: user.bio || '',
      subjects: user.subjects || [],
      hourly_rate: user.hourly_rate || 0
    })
    setShowUserModal(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setEditUserForm({
      name: '',
      email: '',
      user_type: 'student',
      bio: '',
      subjects: [],
      hourly_rate: 0
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    setFormLoading(true)
    try {
      if (selectedUser) {
        // Update existing user
        const { data, error } = await UserService.updateUser(selectedUser.id, {
          name: editUserForm.name,
          bio: editUserForm.bio,
          subjects: editUserForm.subjects,
          hourly_rate: editUserForm.hourly_rate,
          user_type: editUserForm.user_type
        })

        if (error) {
          showNotification('error', 'Failed to update user: ' + error.message)
        } else {
          // Update the local users array
          setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u))
          setShowUserModal(false)
          showNotification('success', 'User updated successfully!')
        }
      } else {
        // Create new user
        const { data, error } = await UserService.createUser({
          email: editUserForm.email,
          name: editUserForm.name,
          user_type: editUserForm.user_type,
          bio: editUserForm.bio,
          subjects: editUserForm.subjects,
          hourly_rate: editUserForm.hourly_rate,
          rating: 0,
          total_sessions: 0,
          total_earnings: 0
        })

        if (error) {
          showNotification('error', 'Failed to create user: ' + error.message)
        } else {
          // Add the new user to the local users array
          setUsers([data!, ...users])
          setShowUserModal(false)
          showNotification('success', 'User created successfully!')
        }
      }
    } catch (error) {
      showNotification('error', `Failed to ${selectedUser ? 'update' : 'create'} user`)
    }
    setFormLoading(false)
  }

  const handleDeleteUser = (user: Profile) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    setFormLoading(true)
    try {
      await UserService.deleteUser(userToDelete.id)
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      showNotification('success', 'User deleted successfully!')
    } catch (error) {
      showNotification('error', 'Failed to delete user')
    }
    setFormLoading(false)
  }

  // Session Management Functions
  const handleEditSession = (session: Session) => {
    setSelectedSession(session)
    setSessionForm({
      student_id: session.student_id,
      mentor_id: session.mentor_id,
      subject: session.subject,
      session_date: session.session_date,
      session_time: session.session_time,
      duration: session.duration,
      amount: session.amount,
      notes: session.notes || '',
      meeting_link: (session as any).meeting_link || ''
    })
    setShowSessionModal(true)
  }

  const handleAddSession = () => {
    setSelectedSession(null)
    setSessionForm({
      student_id: '',
      mentor_id: '',
      subject: '',
      session_date: '',
      session_time: '',
      duration: 60,
      amount: 0,
      notes: '',
      meeting_link: ''
    })
    setShowSessionModal(true)
  }

  const handleSaveSession = async () => {
    setFormLoading(true)
    try {
      if (selectedSession) {
        // Update existing session
        const { data, error } = await SessionService.updateSession(selectedSession.id, {
          subject: sessionForm.subject,
          session_date: sessionForm.session_date,
          session_time: sessionForm.session_time,
          duration: sessionForm.duration,
          amount: sessionForm.amount,
          notes: sessionForm.notes,
          meeting_link: sessionForm.meeting_link
        } as any)

        if (error) {
          showNotification('error', 'Failed to update session: ' + error.message)
        } else {
          // Update the local sessions array
          setSessions(sessions.map(s => s.id === selectedSession.id ? { ...s, ...data } : s))
          setShowSessionModal(false)
          showNotification('success', 'Session updated successfully!')
        }
      } else {
        // Create new session
        if (!sessionForm.student_id || !sessionForm.mentor_id || !sessionForm.subject || !sessionForm.session_date || !sessionForm.session_time) {
          showNotification('error', 'Please fill in all required fields')
          setFormLoading(false)
          return
        }

        const { data, error } = await SessionService.createSession({
          studentId: sessionForm.student_id,
          mentorId: sessionForm.mentor_id,
          subject: sessionForm.subject,
          date: sessionForm.session_date,
          time: sessionForm.session_time,
          duration: sessionForm.duration,
          amount: sessionForm.amount,
          notes: sessionForm.notes,
          meetingLink: sessionForm.meeting_link
        } as any)

        if (error) {
          showNotification('error', 'Failed to create session: ' + error.message)
        } else {
          // Reload sessions to get the new one with populated relations
          await loadDashboardData()
          setShowSessionModal(false)
          showNotification('success', 'Session scheduled successfully!')
        }
      }
    } catch (error) {
      showNotification('error', 'Failed to save session')
    }
    setFormLoading(false)
  }

  const handleCancelSession = async (sessionId: string) => {
    try {
      const { error } = await SessionService.updateSessionStatus(sessionId, 'cancelled')
      if (error) {
        showNotification('error', 'Failed to cancel session')
      } else {
        await loadDashboardData()
        showNotification('success', 'Session cancelled successfully!')
      }
    } catch (error) {
      showNotification('error', 'Failed to cancel session')
    }
  }

  // Program Management Functions
  const handleEditProgram = (program: Program) => {
    setSelectedProgram(program)
    setProgramForm({
      title: program.title,
      description: program.description,
      price: program.price,
      duration_weeks: program.duration_weeks,
      session_count: program.session_count,
      subjects: program.subjects || [''],
      level: program.level,
      is_active: program.is_active
    })
    setShowProgramModal(true)
  }

  const handleAddProgram = () => {
    setSelectedProgram(null)
    setProgramForm({
      title: '',
      description: '',
      price: 0,
      duration_weeks: 4,
      session_count: 8,
      subjects: [''],
      level: 'beginner',
      is_active: true
    })
    setShowProgramModal(true)
  }

  const handleSaveProgram = async () => {
    setFormLoading(true)
    try {
      const programData = {
        ...programForm,
        subjects: programForm.subjects.filter(s => s.trim() !== ''),
        mentor_id: 'admin' // Programs created by admin can be used by all mentors
      }

      let result
      if (selectedProgram) {
        result = await ProgramService.updateProgram(selectedProgram.id, programData)
      } else {
        result = await ProgramService.createProgram(programData)
      }

      if (result.error) {
        showNotification('error', `Failed to ${selectedProgram ? 'update' : 'create'} program: ${result.error.message}`)
      } else {
        // Reload programs data
        const programsResult = await ProgramService.getAllPrograms()
        setPrograms(programsResult.data || [])
        setShowProgramModal(false)
        showNotification('success', `Program ${selectedProgram ? 'updated' : 'created'} successfully!`)
      }
    } catch (error) {
      showNotification('error', `Failed to ${selectedProgram ? 'update' : 'create'} program`)
    }
    setFormLoading(false)
  }

  const handleDeleteProgram = (program: Program) => {
    setProgramToDelete(program)
    setShowDeleteProgramConfirm(true)
  }

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return
    
    setFormLoading(true)
    try {
      await ProgramService.deleteProgram(programToDelete.id)
      setPrograms(programs.filter(p => p.id !== programToDelete.id))
      setShowDeleteProgramConfirm(false)
      setProgramToDelete(null)
      showNotification('success', 'Program deleted successfully!')
    } catch (error) {
      showNotification('error', 'Failed to delete program')
    }
    setFormLoading(false)
  }

  const addSubjectField = () => {
    setProgramForm({
      ...programForm,
      subjects: [...programForm.subjects, '']
    })
  }

  const removeSubjectField = (index: number) => {
    setProgramForm({
      ...programForm,
      subjects: programForm.subjects.filter((_, i) => i !== index)
    })
  }

  const updateSubjectField = (index: number, value: string) => {
    const newSubjects = [...programForm.subjects]
    newSubjects[index] = value
    setProgramForm({
      ...programForm,
      subjects: newSubjects
    })
  }

  const handleLogout = async () => {
    await AuthService.signOut()
    router.push('/')
  }

  const stats = {
    totalUsers: users.length,
    totalMentors: users.filter(u => u.user_type === 'mentor').length,
    totalStudents: users.filter(u => u.user_type === 'student').length,
    totalSessions: sessions.length,
    totalEarnings: users.reduce((sum, user) => sum + (user.total_earnings || 0), 0),
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
    avgRating: users.filter(u => u.rating && u.user_type === 'mentor').reduce((sum, user, _, arr) => sum + (user.rating || 0) / arr.length, 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-800 mb-2">SkillOrbitX Admin</h1>
            <p className="text-gray-600">Please sign in to access the admin panel</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@skillorbitx.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Use admin credentials: admin@skillorbitx.com / GeetaKaSaar_3568
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-800">SkillOrbitX Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '' },
                { id: 'users', name: 'Users', icon: '' },
                { id: 'sessions', name: 'Sessions', icon: '' },
                { id: 'programs', name: 'Programs', icon: '' },
                { id: 'analytics', name: 'Analytics', icon: '' },
                { id: 'settings', name: 'Settings', icon: '' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Users', value: stats.totalUsers, icon: '' },
                { title: 'Total Mentors', value: stats.totalMentors, icon: '' },
                { title: 'Total Students', value: stats.totalStudents, icon: '' },
                { title: 'Total Sessions', value: stats.totalSessions, icon: '' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{stat.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-amber-600 font-semibold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.user_type}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <select 
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddUser}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter((user) => {
                        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            user.email.toLowerCase().includes(searchTerm.toLowerCase())
                        const matchesType = selectedUserType === 'all' || user.user_type === selectedUserType
                        return matchesSearch && matchesType
                      })
                      .map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-amber-600 font-semibold">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.user_type === 'mentor' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.total_sessions || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.rating ? `${user.rating}/5` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-amber-600 hover:text-amber-900 mr-3"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddSession}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Schedule Session
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📅</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">✅</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⏰</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.scheduledSessions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meet Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions
                      .filter(session => {
                        const matchesSearch = session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            session.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            session.mentor?.name.toLowerCase().includes(searchTerm.toLowerCase())
                        const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus
                        return matchesSearch && matchesStatus
                      })
                      .map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{session.subject}</div>
                              <div className="text-sm text-gray-500">{session.notes || 'No notes'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold">{session.student?.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{session.student?.name}</div>
                                <div className="text-sm text-gray-500">{session.student?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 font-semibold">{session.mentor?.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{session.mentor?.name}</div>
                                <div className="text-sm text-gray-500">{session.mentor?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div>{new Date(session.session_date).toLocaleDateString()}</div>
                              <div className="text-gray-500">{session.session_time}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.duration} mins
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{session.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {(session as any).meeting_link ? (
                              <a 
                                href={(session as any).meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 5a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zM7 10a1 1 0 000 2h3a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Join Meeting
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">No link</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleEditSession(session)}
                              className="text-amber-600 hover:text-amber-900 mr-3"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleCancelSession(session.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={session.status === 'cancelled'}
                            >
                              {session.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💰</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">₹{stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">+12% from last month</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">⭐</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.avgRating.toFixed(1)}/5</p>
                    <p className="text-xs text-gray-500">Across all mentors</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📈</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-blue-600">+23%</p>
                    <p className="text-xs text-gray-500">New users this month</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🎯</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{Math.round((stats.completedSessions / stats.totalSessions) * 100) || 0}%</p>
                    <p className="text-xs text-gray-500">Session completion</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Students</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stats.totalStudents / stats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{stats.totalStudents}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Mentors</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.totalMentors / stats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{stats.totalMentors}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Completed</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.completedSessions / stats.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{stats.completedSessions}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Scheduled</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(stats.scheduledSessions / stats.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{stats.scheduledSessions}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Cancelled</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${((stats.totalSessions - stats.completedSessions - stats.scheduledSessions) / stats.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{stats.totalSessions - stats.completedSessions - stats.scheduledSessions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Mentors</h3>
                <div className="space-y-3">
                  {users
                    .filter(u => u.user_type === 'mentor')
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((mentor, index) => (
                      <div key={mentor.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-semibold">{mentor.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-sm text-gray-500">{mentor.subjects?.join(', ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">⭐ {mentor.rating || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{mentor.total_sessions || 0} sessions</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Subjects</h3>
                <div className="space-y-3">
                  {sessions
                    .reduce((acc: { [key: string]: number }, session) => {
                      acc[session.subject] = (acc[session.subject] || 0) + 1
                      return acc
                    }, {})
                    && Object.entries(
                      sessions.reduce((acc: { [key: string]: number }, session) => {
                        acc[session.subject] = (acc[session.subject] || 0) + 1
                        return acc
                      }, {})
                    )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([subject, count], index) => (
                      <div key={subject} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-amber-600 font-semibold">{index + 1}</span>
                          </div>
                          <span className="font-medium text-gray-900">{subject}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-amber-600 h-2 rounded-full" 
                              style={{ width: `${(count / sessions.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Timeline</h3>
              <div className="space-y-4">
                {users.slice(0, 10).map((user, index) => (
                  <div key={user.id} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        New {user.user_type} registered: {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()} at {new Date(user.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'programs' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchTerm}
                    onChange={(e) => setProgramSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <select 
                    value={selectedProgramStatus}
                    onChange={(e) => setSelectedProgramStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="all">All Programs</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddProgram}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Add Program
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Export Programs
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📚</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">✅</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Programs</p>
                    <p className="text-2xl font-bold text-green-600">{programs.filter(p => p.is_active).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💰</div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-amber-600">₹{programs.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {programs
                      .filter((program) => {
                        const matchesSearch = program.title.toLowerCase().includes(programSearchTerm.toLowerCase()) ||
                                            program.description.toLowerCase().includes(programSearchTerm.toLowerCase()) ||
                                            program.subjects?.some(subject => 
                                              subject.toLowerCase().includes(programSearchTerm.toLowerCase())
                                            )
                        const matchesStatus = selectedProgramStatus === 'all' || 
                                            (selectedProgramStatus === 'active' && program.is_active) ||
                                            (selectedProgramStatus === 'inactive' && !program.is_active)
                        return matchesSearch && matchesStatus
                      })
                      .map((program) => (
                      <tr key={program.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{program.title}</div>
                            <div className="text-sm text-gray-500">{program.description?.substring(0, 50)}...</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {program.subjects?.join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            program.level === 'beginner' ? 'bg-green-100 text-green-800' :
                            program.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {program.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {program.duration_weeks} weeks
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {program.session_count} sessions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{program.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            program.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {program.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEditProgram(program)}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProgram(program)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                    <input
                      type="text"
                      defaultValue="SkillOrbitX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@skillorbitx.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Session Duration (minutes)</label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
                    <input
                      type="number"
                      defaultValue="15"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
                    <input
                      type="number"
                      defaultValue="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="IST">India Standard Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-approve Mentors</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                      <option value="false">Manual Review Required</option>
                      <option value="true">Auto-approve</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature Toggles</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { id: 'notifications', name: 'Email Notifications', description: 'Send email notifications to users', enabled: true },
                  { id: 'video_sessions', name: 'Video Sessions', description: 'Enable video calling for sessions', enabled: true },
                  { id: 'file_sharing', name: 'File Sharing', description: 'Allow file uploads in sessions', enabled: true },
                  { id: 'reviews', name: 'Review System', description: 'Enable session reviews and ratings', enabled: true },
                  { id: 'group_sessions', name: 'Group Sessions', description: 'Allow group learning sessions', enabled: false },
                  { id: 'ai_matching', name: 'AI Mentor Matching', description: 'Use AI to suggest mentors', enabled: false }
                ].map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        feature.enabled ? 'bg-amber-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          feature.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Database</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">Supabase PostgreSQL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="text-gray-900">14.9</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Application</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="text-gray-900">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Framework:</span>
                      <span className="text-gray-900">Next.js 15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node.js:</span>
                      <span className="text-gray-900">v18.17.0</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Storage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used:</span>
                      <span className="text-gray-900">2.3 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="text-gray-900">97.7 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Files:</span>
                      <span className="text-gray-900">1,247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Maintenance</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Database Backup</h4>
                    <p className="text-sm text-gray-600 mb-3">Create a full backup of the database</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Last backup: 2 hours ago</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Backup Now
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Clear Cache</h4>
                    <p className="text-sm text-gray-600 mb-3">Clear application cache to improve performance</p>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      Clear Cache
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">System Logs</h4>
                    <p className="text-sm text-gray-600 mb-3">Download system logs for debugging</p>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Download Logs
                    </button>
                  </div>
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600 mb-3">Enable maintenance mode for system updates</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Enable Maintenance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">{notification.type === 'success' ? '✓' : '✕'}</span>
            {notification.message}
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-w-lg">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                    disabled={!!selectedUser}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 ${
                      selectedUser ? 'bg-gray-100 text-gray-500' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Type</label>
                  <select
                    value={editUserForm.user_type}
                    onChange={(e) => setEditUserForm({...editUserForm, user_type: e.target.value as 'student' | 'mentor'})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={editUserForm.bio}
                    onChange={(e) => setEditUserForm({...editUserForm, bio: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                {editUserForm.user_type === 'mentor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={editUserForm.hourly_rate}
                      onChange={(e) => setEditUserForm({...editUserForm, hourly_rate: Number(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : selectedUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete {userToDelete.name}? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedSession ? 'Edit Session' : 'Schedule New Session'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!selectedSession && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student</label>
                      <select
                        value={sessionForm.student_id}
                        onChange={(e) => setSessionForm({...sessionForm, student_id: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Select Student</option>
                        {users.filter(u => u.user_type === 'student').map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mentor</label>
                      <select
                        value={sessionForm.mentor_id}
                        onChange={(e) => setSessionForm({...sessionForm, mentor_id: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Select Mentor</option>
                        {users.filter(u => u.user_type === 'mentor').map(mentor => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.name} ({mentor.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={sessionForm.subject}
                    onChange={(e) => setSessionForm({...sessionForm, subject: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Machine Learning Basics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={sessionForm.session_date}
                    onChange={(e) => setSessionForm({...sessionForm, session_date: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    value={sessionForm.session_time}
                    onChange={(e) => setSessionForm({...sessionForm, session_time: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <select
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({...sessionForm, duration: Number(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={5}>5 minutes (Free Consultation)</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                  <input
                    type="number"
                    value={sessionForm.amount}
                    onChange={(e) => setSessionForm({...sessionForm, amount: Number(e.target.value)})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="0 for free sessions"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Google Meet Link</label>
                  <input
                    type="url"
                    value={sessionForm.meeting_link}
                    onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  />
                  <p className="mt-1 text-sm text-gray-500">Optional: Add a Google Meet link for the session</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Any additional notes or session agenda..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSession}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : selectedSession ? 'Update Session' : 'Schedule Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedProgram ? 'Edit Program' : 'Add New Program'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Advanced Machine Learning Course"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Detailed description of the program..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input
                      type="number"
                      value={programForm.price}
                      onChange={(e) => setProgramForm({...programForm, price: Number(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <select
                      value={programForm.level}
                      onChange={(e) => setProgramForm({...programForm, level: e.target.value as any})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
                    <input
                      type="number"
                      value={programForm.duration_weeks}
                      onChange={(e) => setProgramForm({...programForm, duration_weeks: Number(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Sessions</label>
                    <input
                      type="number"
                      value={programForm.session_count}
                      onChange={(e) => setProgramForm({...programForm, session_count: Number(e.target.value)})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                  {programForm.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => updateSubjectField(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder={`Subject ${index + 1}`}
                      />
                      {programForm.subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubjectField(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSubjectField}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Add Subject
                  </button>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={programForm.is_active}
                      onChange={(e) => setProgramForm({...programForm, is_active: e.target.checked})}
                      className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Program</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgram}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : 'Save Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Program Confirmation Modal */}
      {showDeleteProgramConfirm && programToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Program</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the program "{programToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteProgramConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProgram}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
