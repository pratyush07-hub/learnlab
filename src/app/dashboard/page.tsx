'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Search, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  Target, 
  Star,
  Bell,
  Settings,
  LogOut,
  Clock,
  GraduationCap
} from 'lucide-react'

export default function StudentDashboard() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Handle URL parameters on component mount
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'mentors', 'programs', 'projects', 'sessions', 'messages', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'mentors', label: 'Find Mentors', icon: Search },
    { id: 'programs', label: 'Programs', icon: GraduationCap },
    { id: 'projects', label: 'My Projects', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">LearnLab</h1>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="text-gray-600 text-sm sm:text-base hidden sm:inline">Student Dashboard</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Settings size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                <LogOut size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden overflow-x-auto mb-4">
            <div className="flex space-x-2 min-w-max px-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="premium-card p-6 rounded-3xl space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 lg:col-span-4">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'mentors' && <FindMentors />}
            {activeTab === 'programs' && <Programs />}
            {activeTab === 'projects' && <MyProjects />}
            {activeTab === 'sessions' && <Sessions />}
            {activeTab === 'messages' && <Messages />}
            {activeTab === 'profile' && <Profile />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, Alex! 👋</h2>
        <p className="text-gray-600 text-sm sm:text-base">Here's your research progress overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Active Projects</p>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">3</p>
            </div>
            <BookOpen className="text-orange-500" size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Mentor Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">12</p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">Achievement Score</p>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">85%</p>
            </div>
            <Star className="text-orange-500" size={24} />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="premium-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Recent Activity</h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base">Session with Dr. Sarah Chen completed</p>
              <p className="text-gray-600 text-sm">Machine Learning Research - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">New project milestone achieved</p>
              <p className="text-gray-600 text-sm">AI Ethics Research - 1 day ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Research paper draft submitted</p>
              <p className="text-gray-600 text-sm">Climate Change Analysis - 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function FindMentors() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Find Your Perfect Mentor</h2>
      <p className="text-gray-600">Mentor discovery interface coming soon...</p>
    </div>
  )
}

function MyProjects() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">My Research Projects</h2>
      <p className="text-gray-600">Project management interface coming soon...</p>
    </div>
  )
}

function Sessions() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
      <p className="text-gray-600">Session calendar coming soon...</p>
    </div>
  )
}

function Messages() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <p className="text-gray-600">Chat interface coming soon...</p>
    </div>
  )
}

function Profile() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <p className="text-gray-600">Profile management coming soon...</p>
    </div>
  )
}

function Programs() {
  return (
    <div className="space-y-6">
      {/* LearnLab Store Redirect */}
      <div className="premium-card p-8 rounded-3xl text-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Programs</h2>
            <p className="text-lg text-gray-600 mb-6">
              Discover our comprehensive learning programs designed to accelerate your research and academic journey. 
              Choose from various specializations and get personalized guidance from expert mentors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Mentorship</h3>
              <p className="text-sm text-gray-600">Get personalized guidance from industry experts and researchers</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Learning</h3>
              <p className="text-sm text-gray-600">Learn at your own pace with structured programs and deadlines</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Goal-Oriented</h3>
              <p className="text-sm text-gray-600">Programs designed to achieve specific research and career goals</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.open('https://pages.razorpay.com/stores/learnlab', '_blank')}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Browse All Programs
            </button>
            
            <p className="text-sm text-gray-500">
              You'll be redirected to our secure LearnLab store powered by Razorpay
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Not sure which program is right for you? Get personalized recommendations from our counselors.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Contact Counselor →
              </button>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Free Consultation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Book a free 30-minute consultation to discuss your goals and get program recommendations.
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                Book Consultation →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Program Categories Preview */}
      <div className="premium-card p-6 rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Program Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Research Writing', icon: '📝', count: '12+' },
            { name: 'Data Analysis', icon: '📊', count: '8+' },
            { name: 'Literature Review', icon: '📚', count: '6+' },
            { name: 'Thesis Support', icon: '🎓', count: '15+' },
            { name: 'Publication Help', icon: '📄', count: '10+' },
            { name: 'Coding & Tools', icon: '💻', count: '20+' },
            { name: 'Statistics', icon: '📈', count: '9+' },
            { name: 'Career Guidance', icon: '🎯', count: '5+' }
          ].map((category, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h4>
              <p className="text-xs text-gray-500">{category.count} programs</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}