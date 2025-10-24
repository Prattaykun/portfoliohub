'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import UserProfileSection from '@/components/dashboard/UserProfileSection'
import AboutSection from '@/components/dashboard/AboutSection'
import SkillsSection from '@/components/dashboard/SkillsSection'
import ProjectsSection from '@/components/dashboard/ProjectsSection'
import ContactSection from '@/components/dashboard/ContactSection'
import ResumeSection from '@/components/dashboard/ResumeSection'
import SharePortfolio from '@/components/dashboard/SharePortfolio'
import LanguageInterests from '@/components/dashboard/LanguageInterests'

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    setUser(user)
    await checkUserProfile(user.id)
  }

  const checkUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('uid', userId)
      .single()

    if (error || !profile) {
      router.push('/profile-form')
      return
    }

    setUserProfile(profile)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const sections = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'about', name: 'About', icon: '📝' },
    { id: 'skills', name: 'Skills', icon: '💡' },
    { id: 'projects', name: 'Projects', icon: '🚀' },
    { id: 'languages', name: 'Languages & Interests', icon: '🌐' },
    { id: 'contact', name: 'Contact', icon: '📞' },
    { id: 'resume', name: 'Resume', icon: '📄' },
    { id: 'share', name: 'Share', icon: '🔗' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 pt-30 left-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-2">Manage your portfolio</p>
        </div>
        
        <nav className="mt-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3 text-lg">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}

  <div className="ml-64 pt-30 px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {activeSection === 'profile' && (
            <UserProfileSection user={user} userProfile={userProfile} />
          )}
          {activeSection === 'about' && <AboutSection user={user} />}
          {activeSection === 'skills' && <SkillsSection user={user} />}
          {activeSection === 'projects' && <ProjectsSection user={user} />}
          {activeSection === 'languages' && <LanguageInterests user={user} />}
          {activeSection === 'contact' && <ContactSection user={user} />}
          {activeSection === 'resume' && <ResumeSection user={user} />}
          {activeSection === 'share' && <SharePortfolio user={user} />}
        </div>
      </div>
    </div>
  )
}