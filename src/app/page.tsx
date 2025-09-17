'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Users, BookOpen, Target, Star, Zap, Shield } from 'lucide-react'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signin' as 'signin' | 'signup' })

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin' })
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold gradient-text"
            >
              LearnLab
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-orange-500 transition-colors">Features</a>
              <a href="#mentors" className="text-gray-700 hover:text-orange-500 transition-colors">Mentors</a>
              <a href="#pricing" className="text-gray-700 hover:text-orange-500 transition-colors">Pricing</a>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal('signin')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full transition-all"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-6xl font-black leading-tight">
                <span className="gradient-text">Premium</span>
                <br />
                Research
                <br />
                <span className="text-black">Mentorship</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Connect with world-class mentors for personalized research guidance. 
                Transform your curiosity into groundbreaking discoveries.
              </p>
              <div className="flex items-center space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAuthModal('signup')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center space-x-2 transition-all"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-orange-500 transition-colors"
                >
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <div className="premium-card p-8 rounded-3xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Expert Mentors</h3>
                      <p className="text-gray-600">PhD researchers & industry leaders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <BookOpen className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Personalized Learning</h3>
                      <p className="text-gray-600">Tailored to your interests</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Target className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Real Results</h3>
                      <p className="text-gray-600">Published papers & competitions</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div whileHover={{ scale: 1.05 }} className="micro-bounce">
              <div className="text-4xl font-bold">2,500+</div>
              <div className="text-orange-100">Active Students</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="micro-bounce">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-orange-100">Expert Mentors</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="micro-bounce">
              <div className="text-4xl font-bold">1,200+</div>
              <div className="text-orange-100">Research Projects</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="micro-bounce">
              <div className="text-4xl font-bold">98%</div>
              <div className="text-orange-100">Success Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">LearnLab</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of personalized education with our cutting-edge platform 
              designed specifically for young researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="premium-card p-8 rounded-3xl transition-all group"
            >
              <Shield className="text-orange-500 mb-4 group-hover:animate-pulse" size={48} />
              <h3 className="text-xl font-bold mb-4">Verified Experts</h3>
              <p className="text-gray-600">
                All mentors are thoroughly vetted with verified credentials from top institutions worldwide.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="premium-card p-8 rounded-3xl transition-all group"
            >
              <Zap className="text-orange-500 mb-4 group-hover:animate-pulse" size={48} />
              <h3 className="text-xl font-bold mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Our advanced algorithm connects you with the perfect mentor based on your interests and goals.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="premium-card p-8 rounded-3xl transition-all group"
            >
              <Star className="text-orange-500 mb-4 group-hover:animate-pulse" size={48} />
              <h3 className="text-xl font-bold mb-4">Premium Support</h3>
              <p className="text-gray-600">
                24/7 support team ready to help you succeed in your research journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-black via-gray-900 to-orange-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold text-white">
              Ready to Transform Your <span className="gradient-text">Research Journey</span>?
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of students who have already discovered their potential with LearnLab.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuthModal('signup')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-6 rounded-full text-xl font-bold transition-all"
            >
              Start Your Free Trial
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        setMode={(mode) => setAuthModal({ ...authModal, mode })}
      />
    </main>
  )
}
