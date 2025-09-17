'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Star, Play, CheckCircle, Users, BookOpen, 
  Target, Zap, Globe, Shield, Award, TrendingUp, 
  MessageSquare, Video, Calendar, Brain, Sparkles,
  ChevronRight, Quote, Download, BarChart3
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { AuthService } from '@/services/auth';

export default function HomePage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { user, profile } = await AuthService.getCurrentUser();
      if (user && profile) {
        // User is already logged in, redirect to appropriate dashboard
        if (profile.user_type === 'mentor') {
          router.push('/mentor-dashboard');
        } else {
          router.push('/student-dashboard');
        }
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (user: any, userType: 'student' | 'mentor') => {
    // Redirect to appropriate dashboard
    if (userType === 'mentor') {
      router.push('/mentor-dashboard');
    } else {
      router.push('/student-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-3xl border-b border-gray-100/50 shadow-sm"
        style={{ backdropFilter: 'blur(40px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logoskx.png" 
                alt="LearnLab Logo" 
                className="h-7 w-auto object-contain"
              />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200">Success Stories</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200">Pricing</a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors duration-200 px-4 py-2 rounded-full"
              >
                Sign In
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:from-amber-600 hover:to-orange-600"
                style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Open main menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-gray-100"
              >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-3xl">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    How it Works
                  </a>
                  <a
                    href="#testimonials"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Success Stories
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    Pricing
                  </a>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="pt-4 border-t border-gray-100">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAuthMode('signin');
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      Sign In
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:from-amber-600 hover:to-orange-600"
                    >
                      Get Started
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium border border-amber-200/50"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Expert Research Mentorship Platform
                </motion.div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Connect with
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent block">
                    Research Mentors
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-600 block mt-1 sm:mt-2 font-medium">
                    Book Your Free Session
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Get personalized guidance from world-class research mentors. Start with a free 5-minute consultation to find your perfect mentor match and accelerate your research journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl font-semibold text-sm sm:text-base hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Book Free Session (5 min)
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </motion.button>
                
                <motion.button
                  className="border border-gray-300 text-gray-700 px-6 py-3 sm:px-7 sm:py-3.5 rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  View Mentors
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0 pt-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white font-medium text-xs shadow-sm">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 ml-2">500+ mentors available</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                  ))}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">4.9/5 rating</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mt-8 lg:mt-0"
            >
              <div 
                className="bg-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-200/50"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div 
                  className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-amber-100/50"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md"
                          style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                        >
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">Mentor Dashboard</h3>
                          <p className="text-xs text-gray-500">Schedule your sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">5 min</div>
                        <div className="text-xs text-gray-500">Free Session</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Available Mentors</span>
                        <span className="text-xs font-semibold text-gray-700">12 Online</span>
                      </div>
                      <div className="flex -space-x-2">
                        {['Dr. Smith', 'Prof. Lee', 'Dr. Chen', 'Prof. Kim'].map((mentor, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                            style={{ boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}
                          >
                            {mentor.split(' ')[1][0]}
                          </div>
                        ))}
                        <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                          +8
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className="text-center p-3 bg-white/80 rounded-xl border border-gray-100/50"
                        style={{ backdropFilter: 'blur(10px)' }}
                      >
                        <div className="text-lg font-bold text-gray-900">24</div>
                        <div className="text-xs text-gray-500">Sessions Booked</div>
                      </div>
                      <div 
                        className="text-center p-3 bg-white/80 rounded-xl border border-gray-100/50"
                        style={{ backdropFilter: 'blur(10px)' }}
                      >
                        <div className="text-lg font-bold text-gray-900">8</div>
                        <div className="text-xs text-gray-500">Programs Available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need for
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent block">
                Research Success
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From free consultation to program completion - we guide you every step of the way
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Free Mentor Consultation",
                description: "Start with a 5-minute free session to discuss your research goals and get matched with the perfect mentor",
                color: "from-amber-400 to-orange-500",
                stats: "5 min free"
              },
              {
                icon: Video,
                title: "Flexible Scheduling",
                description: "Book sessions based on mentor availability with easy Google Meet integration for seamless meetings",
                color: "from-orange-400 to-yellow-500",
                stats: "24/7 booking"
              },
              {
                icon: BarChart3,
                title: "Personal Dashboard",
                description: "Track your sessions, view upcoming meetings, and monitor your research progress all in one place",
                color: "from-yellow-400 to-amber-500",
                stats: "Real-time tracking"
              },
              {
                icon: Globe,
                title: "Custom Programs",
                description: "Get personalized program recommendations based on your consultation and research needs",
                color: "from-amber-500 to-orange-400",
                stats: "Tailored for you"
              },
              {
                icon: Shield,
                title: "Secure File Sharing",
                description: "Upload and share research files securely through our integrated chat system with your mentor",
                color: "from-orange-500 to-yellow-400",
                stats: "End-to-end encrypted"
              },
              {
                icon: Brain,
                title: "Integrated Chat System",
                description: "Communicate with mentors, share files, and schedule meetings all through our built-in messaging platform",
                color: "from-yellow-500 to-amber-400",
                stats: "Instant messaging"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02]"
                whileHover={{ y: -4 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div 
                    className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)' }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <span 
                      className="text-xs font-medium text-amber-700 px-2.5 py-1 rounded-full"
                      style={{ 
                        background: 'rgba(251, 191, 36, 0.1)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              How LearnLab
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to connect with mentors and accelerate your research
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Book Free Session",
                description: "Start with a 5-minute free consultation to discuss your research goals and challenges",
                icon: Target
              },
              {
                step: "02",
                title: "Choose Your Mentor",
                description: "Browse mentor profiles and schedule sessions based on their availability and expertise",
                icon: Users
              },
              {
                step: "03",
                title: "Join & Track Sessions",
                description: "Use your dashboard to join Google Meet sessions and track all your mentorship activities",
                icon: Video
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div 
                  className="rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="relative mb-6">
                    <div 
                      className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 hover:scale-110"
                      style={{ boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div 
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4)' }}
                    >
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-6 h-6 text-amber-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Additional Step */}
          <div className="mt-12 text-center">
            <div 
              className="inline-block rounded-3xl p-8 transition-all duration-500"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}
                  >
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Program Recommendation</h3>
                  <p className="text-gray-600 max-w-sm">After your consultation, receive personalized program suggestions and proceed to purchase the perfect plan for your research needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 lg:py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Success Stories from
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent block"> Our Students</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join thousands of students who've accelerated their research journey with expert mentorship</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                role: "PhD Student, MIT",
                content: "The free session was incredibly valuable! My mentor helped me focus my research direction and recommended the perfect program. The scheduling system made it so easy to book regular sessions.",
                rating: 5,
                avatar: "SC",
                achievement: "Research Focused"
              },
              {
                name: "Marcus Rodriguez",
                role: "Graduate Researcher",
                content: "I was stuck on my thesis methodology until I connected with Dr. Kumar through LearnLab. The chat feature with file sharing made collaboration seamless, and the program recommendations were spot-on.",
                rating: 5,
                avatar: "MR",
                achievement: "Thesis Completed"
              },
              {
                name: "Emily Watson",
                role: "Undergraduate Researcher",
                content: "The mentor dashboard is amazing - I can track all my sessions, access shared files, and see my progress. Dr. Patel's guidance through the research fundamentals program was transformative.",
                rating: 5,
                avatar: "EW",
                achievement: "Skills Transformed"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02]"
                whileHover={{ y: -4 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <span 
                    className="ml-2 text-xs font-medium text-orange-700 px-2.5 py-1 rounded-full"
                    style={{ 
                      background: 'rgba(251, 146, 60, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {testimonial.achievement}
                  </span>
                </div>
                <Quote className="w-6 h-6 text-amber-300 mb-3" />
                <p className="text-gray-700 mb-5 italic leading-relaxed text-sm">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Ready to Start Your
              <span className="block">Research Journey?</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of students connecting with expert mentors and accelerating their research goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                className="text-orange-600 px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
                }}
              >
                Book Free Session (5 min)
                <ArrowRight className="w-4 h-4 ml-2 inline-block" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="border border-white/30 text-white px-8 py-3.5 rounded-2xl font-semibold text-base transition-all duration-300"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                Browse Mentors
              </motion.button>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">Free</div>
                <div className="text-white/80 text-sm">5-Min Consultation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-white/80 text-sm">Expert Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">24/7</div>
                <div className="text-white/80 text-sm">Chat Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img 
                src="https://tepysveqbchnyjkeyjnh.supabase.co/storage/v1/object/public/skillorbitx/logoskx.png" 
                alt="LearnLab Logo" 
                className="h-8 w-auto object-contain"
              />
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing research through AI-powered mentorship and global collaboration networks.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center hover:from-amber-600 hover:to-orange-600 transition-all duration-300">
                  <span className="text-white font-bold">T</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center hover:from-amber-600 hover:to-orange-600 transition-all duration-300">
                  <span className="text-white font-bold">L</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center hover:from-amber-600 hover:to-orange-600 transition-all duration-300">
                  <span className="text-white font-bold">G</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">AI Research Tools</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Mentor Network</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Collaboration Hub</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Analytics Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Research Library</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 LearnLab. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400">Trusted by researchers worldwide</span>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-amber-400 text-sm">System Status: All Good</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
      />
    </div>
  );
}
