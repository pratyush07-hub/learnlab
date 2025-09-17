'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Users, 
  Calendar, 
  MessageCircle, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Clock,
  Award
} from 'lucide-react'

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'sessions', label: 'Sessions', icon: Clock },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'resources', label: 'Resources', icon: BookOpen },
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
              <span className="text-gray-600">Mentor Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  5
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
            {activeTab === 'overview' && <MentorOverview />}
            {activeTab === 'students' && <MyStudents />}
            {activeTab === 'schedule' && <Schedule />}
            {activeTab === 'sessions' && <Sessions />}
            {activeTab === 'earnings' && <Earnings />}
            {activeTab === 'messages' && <Messages />}
            {activeTab === 'resources' && <Resources />}
            {activeTab === 'profile' && <Profile />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mentor Overview Component
function MentorOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Good morning, Dr. Sarah! 🌟</h2>
        <p className="text-gray-600">Here's your mentorship dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Students</p>
              <p className="text-3xl font-bold gradient-text">12</p>
            </div>
            <Users className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-3xl font-bold gradient-text">28h</p>
            </div>
            <Clock className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rating</p>
              <p className="text-3xl font-bold gradient-text">4.9</p>
            </div>
            <Award className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Earnings</p>
              <p className="text-3xl font-bold gradient-text">$2,840</p>
            </div>
            <DollarSign className="text-orange-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">Today's Sessions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="font-medium">Alex Chen</p>
                <p className="text-gray-600 text-sm">Machine Learning Research</p>
              </div>
              <div className="text-right">
                <p className="font-medium">2:00 PM</p>
                <p className="text-gray-600 text-sm">60 min</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Maria Rodriguez</p>
                <p className="text-gray-600 text-sm">Data Science Project</p>
              </div>
              <div className="text-right">
                <p className="font-medium">4:30 PM</p>
                <p className="text-gray-600 text-sm">90 min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Session completed with Alex Chen</p>
                <p className="text-gray-600 text-sm">ML Algorithm Review - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">New student application</p>
                <p className="text-gray-600 text-sm">Emma Thompson - Computer Vision - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Resource uploaded</p>
                <p className="text-gray-600 text-sm">Neural Networks Guide - 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function MyStudents() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">My Students</h2>
      <p className="text-gray-600">Student management interface coming soon...</p>
    </div>
  )
}

function Schedule() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Schedule Management</h2>
      <p className="text-gray-600">Calendar interface coming soon...</p>
    </div>
  )
}

function Sessions() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Session History</h2>
      <p className="text-gray-600">Session management coming soon...</p>
    </div>
  )
}

function Earnings() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Earnings Dashboard</h2>
      <p className="text-gray-600">Financial dashboard coming soon...</p>
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

function Resources() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
      <p className="text-gray-600">Resource library coming soon...</p>
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