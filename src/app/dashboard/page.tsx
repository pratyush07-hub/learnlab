'use client'

import { useState } from 'react'
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
  LogOut
} from 'lucide-react'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'mentors', label: 'Find Mentors', icon: Search },
    { id: 'projects', label: 'My Projects', icon: BookOpen },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text">LearnLab</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Student Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Settings size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'mentors' && <FindMentors />}
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, Alex! 👋</h2>
        <p className="text-gray-600">Here's your research progress overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Projects</p>
              <p className="text-3xl font-bold gradient-text">3</p>
            </div>
            <BookOpen className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mentor Sessions</p>
              <p className="text-3xl font-bold gradient-text">12</p>
            </div>
            <Calendar className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Achievement Score</p>
              <p className="text-3xl font-bold gradient-text">85%</p>
            </div>
            <Star className="text-orange-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="premium-card p-6 rounded-3xl">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium">Session with Dr. Sarah Chen completed</p>
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