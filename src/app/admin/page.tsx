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
  Shield,
  BarChart3,
  FileText,
  AlertTriangle
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'mentors', label: 'Mentor Approval', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold gradient-text">LearnLab</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Admin Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <AlertTriangle size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>
              <button className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  7
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
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'mentors' && <MentorApproval />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'financial' && <Financial />}
            {activeTab === 'content' && <Content />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'support' && <Support />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Overview Component
function AdminOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Platform Overview 📊</h2>
        <p className="text-gray-600">System-wide analytics and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold gradient-text">3,247</p>
              <p className="text-green-500 text-sm">↗ +12% this month</p>
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
              <p className="text-gray-600 text-sm">Active Mentors</p>
              <p className="text-3xl font-bold gradient-text">486</p>
              <p className="text-green-500 text-sm">↗ +8% this month</p>
            </div>
            <Shield className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-3xl font-bold gradient-text">$47K</p>
              <p className="text-green-500 text-sm">↗ +23% this month</p>
            </div>
            <DollarSign className="text-orange-500" size={32} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="premium-card p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Session Rating</p>
              <p className="text-3xl font-bold gradient-text">4.8</p>
              <p className="text-green-500 text-sm">↗ +0.1 this month</p>
            </div>
            <TrendingUp className="text-orange-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">Pending Actions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="font-medium">Mentor Applications</p>
                <p className="text-gray-600 text-sm">5 pending approval</p>
              </div>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm">
                Review
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div>
                <p className="font-medium">Reported Issues</p>
                <p className="text-gray-600 text-sm">2 urgent reports</p>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                Address
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="font-medium">Payment Issues</p>
                <p className="text-gray-600 text-sm">3 failed transactions</p>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                Resolve
              </button>
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response Time</span>
              <span className="text-green-500 font-medium">142ms ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Performance</span>
              <span className="text-green-500 font-medium">98.7% ✓</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Sessions</span>
              <span className="text-orange-500 font-medium">247 users</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Uptime</span>
              <span className="text-green-500 font-medium">99.9% ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder components for other tabs
function UserManagement() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <p className="text-gray-600">User administration interface coming soon...</p>
    </div>
  )
}

function MentorApproval() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Mentor Approval System</h2>
      <p className="text-gray-600">Mentor verification interface coming soon...</p>
    </div>
  )
}

function Analytics() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
      <p className="text-gray-600">Analytics dashboard coming soon...</p>
    </div>
  )
}

function Financial() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Financial Management</h2>
      <p className="text-gray-600">Financial dashboard coming soon...</p>
    </div>
  )
}

function Content() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Content Management</h2>
      <p className="text-gray-600">Content management system coming soon...</p>
    </div>
  )
}

function Reports() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">System Reports</h2>
      <p className="text-gray-600">Reporting interface coming soon...</p>
    </div>
  )
}

function Support() {
  return (
    <div className="premium-card p-6 rounded-3xl">
      <h2 className="text-2xl font-bold mb-4">Support Center</h2>
      <p className="text-gray-600">Support management coming soon...</p>
    </div>
  )
}