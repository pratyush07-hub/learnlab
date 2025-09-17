'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, Users, BookOpen, Calendar, MessageCircle, Settings, User } from 'lucide-react'
import Link from 'next/link'

interface MobileNavProps {
  userType: 'student' | 'mentor' | 'admin'
  currentPath: string
}

export default function MobileNav({ userType, currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getNavigationItems = () => {
    switch (userType) {
      case 'student':
        return [
          { icon: Home, label: 'Dashboard', href: '/dashboard' },
          { icon: Users, label: 'Find Mentors', href: '/dashboard?tab=mentors' },
          { icon: BookOpen, label: 'My Projects', href: '/dashboard?tab=projects' },
          { icon: Calendar, label: 'Sessions', href: '/dashboard?tab=sessions' },
          { icon: MessageCircle, label: 'Messages', href: '/dashboard?tab=messages' },
          { icon: User, label: 'Profile', href: '/dashboard?tab=profile' },
        ]
      case 'mentor':
        return [
          { icon: Home, label: 'Dashboard', href: '/mentor' },
          { icon: Users, label: 'My Students', href: '/mentor?tab=students' },
          { icon: Calendar, label: 'Schedule', href: '/mentor?tab=schedule' },
          { icon: MessageCircle, label: 'Messages', href: '/mentor?tab=messages' },
          { icon: BookOpen, label: 'Resources', href: '/mentor?tab=resources' },
          { icon: User, label: 'Profile', href: '/mentor?tab=profile' },
        ]
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', href: '/admin' },
          { icon: Users, label: 'Users', href: '/admin?tab=users' },
          { icon: Settings, label: 'Settings', href: '/admin?tab=settings' },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold gradient-text">LearnLab</h1>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-6">
                <div className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = currentPath === item.href || 
                      (item.href.includes('?tab=') && currentPath.includes(item.href.split('?tab=')[1]))
                    
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Bottom Navigation for Mobile
interface BottomNavProps {
  userType: 'student' | 'mentor' | 'admin'
  currentPath: string
}

export function BottomNav({ userType, currentPath }: BottomNavProps) {
  const getQuickItems = () => {
    switch (userType) {
      case 'student':
        return [
          { icon: Home, label: 'Home', href: '/dashboard' },
          { icon: Users, label: 'Mentors', href: '/dashboard?tab=mentors' },
          { icon: BookOpen, label: 'Projects', href: '/dashboard?tab=projects' },
          { icon: MessageCircle, label: 'Messages', href: '/dashboard?tab=messages' },
          { icon: User, label: 'Profile', href: '/dashboard?tab=profile' },
        ]
      case 'mentor':
        return [
          { icon: Home, label: 'Home', href: '/mentor' },
          { icon: Users, label: 'Students', href: '/mentor?tab=students' },
          { icon: Calendar, label: 'Schedule', href: '/mentor?tab=schedule' },
          { icon: MessageCircle, label: 'Messages', href: '/mentor?tab=messages' },
          { icon: User, label: 'Profile', href: '/mentor?tab=profile' },
        ]
      default:
        return []
    }
  }

  const quickItems = getQuickItems()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex items-center justify-around py-2">
        {quickItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href || 
            (item.href.includes('?tab=') && currentPath.includes(item.href.split('?tab=')[1]))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}