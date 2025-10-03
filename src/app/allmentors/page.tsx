'use client'

import { Profile, getAllMentors } from '@/lib/supabase'
import { useEffect, useState } from 'react'

// Generate initials from mentor name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true)
      const { data, error } = await getAllMentors();
      console.log(data);

      if (error) {
        console.error('Error fetching mentors:', error)
      } else {
        setMentors(data || [])
      }

      setLoading(false)
    }

    fetchMentors()
  }, [])

  // Get all unique subjects for filtering
  const allSubjects = Array.from(
    new Set(mentors.flatMap(mentor => mentor.subjects || []))
  )

  // Filter mentors based on search and subject
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (mentor.bio && mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSubject = !selectedSubject || (mentor.subjects && mentor.subjects.includes(selectedSubject))
    
    return matchesSearch && matchesSubject
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-primary font-medium">Loading mentors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Meet Our Expert Mentors
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with experienced professionals who are passionate about sharing their knowledge and helping you grow.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search mentors by name, email, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            
            {/* Subject Filter */}
            <div className="md:w-64">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="">All Subjects</option>
                {allSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredMentors.length} of {mentors.length} mentors
          </p>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No mentors found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-slate-200"
              >
                {/* Mentor Avatar */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl font-bold text-white">
                      {getInitials(mentor.name)}
                    </span>
                  </div>
                  {/* Online Status Indicator */}
                  <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Mentor Info */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary mb-1">{mentor.name}</h3>
                    <p className="text-slate-500 text-sm">{mentor.email}</p>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-slate-600 text-sm text-center mb-4 line-clamp-2">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Subjects */}
                  {mentor.subjects && mentor.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject}
                          className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                      {mentor.subjects.length > 3 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                          +{mentor.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    {mentor.rating && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {mentor.total_sessions && (
                      <div className="text-slate-500">
                        {mentor.total_sessions} sessions
                      </div>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  {mentor.hourly_rate && (
                    <div className="text-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        ${mentor.hourly_rate}
                      </span>
                      <span className="text-slate-500 text-sm">/hour</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200 group-hover:shadow-lg">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
