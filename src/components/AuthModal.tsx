'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { AuthService, SignUpData } from '@/services/auth'
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  setMode: (mode: 'signin' | 'signup') => void
  onLogin?: (user: any, userType: 'student' | 'mentor') => void
}

export default function AuthModal({ isOpen, onClose, mode, setMode, onLogin }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState<'student' | 'mentor'>('student')
  const [subjects, setSubjects] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const signUpData: SignUpData = {
          email,
          password,
          name: fullName,
          userType,
          subjects: userType === 'mentor' ? subjects : undefined,
          hourlyRate: userType === 'mentor' && hourlyRate ? parseFloat(hourlyRate) : undefined,
          bio: userType === 'mentor' ? bio : undefined
        }

        const { user, profile, error } = await AuthService.signUp(signUpData)
        if (error) throw error
        
        // Call onLogin with user data and type
        if (onLogin && user && profile) {
          onLogin(user, profile.user_type)
        }
        onClose()
      } else {
        const { user, profile, error } = await AuthService.signIn(email, password)
        if (error) throw error
        
        if (onLogin && user && profile) {
          onLogin(user, profile.user_type)
        }
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="premium-card p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl max-w-md w-full space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
            {mode === 'signin' ? 'Welcome Back' : 'Join LearnLab'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {mode === 'signin' 
              ? 'Sign in to continue your research journey' 
              : 'Start your premium research mentorship experience'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-2 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-full font-semibold transition-all ${
                    userType === 'student'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-amber-500'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('mentor')}
                  className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-full font-semibold transition-all ${
                    userType === 'mentor'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:border-amber-500'
                  }`}
                >
                  Mentor
                </button>
              </div>

              {userType === 'mentor' && (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      value={subjects.join(', ')}
                      onChange={(e) => setSubjects(e.target.value.split(', ').filter(s => s.trim()))}
                      placeholder="Subjects you teach (e.g., Mathematics, Physics)"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="Hourly rate ($)"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief bio describing your expertise"
                      rows={3}
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
          </div>

          <div className="relative w-full">
      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

          {error && (
            <div className="text-red-500 text-xs sm:text-sm text-center p-2 bg-red-50 rounded-lg">{error}</div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 sm:py-3 rounded-full font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </motion.button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-amber-600 hover:text-orange-600 font-semibold transition-colors duration-200 text-sm sm:text-base"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          ✕
        </button>
      </motion.div>
    </div>
  )
}