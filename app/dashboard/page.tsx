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
import { Menu, X, MoreHorizontal } from 'lucide-react'

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('profile')
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Split into visible (bottom bar) and extra (dropdown)
  const bottomTabs = sections.slice(0, 5)
  const extraTabs = sections.slice(5)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Sidebar */}
  <div className="hidden md:fixed md:inset-y-0 md:pt-20 md:left-0 md:w-64 md:bg-white md:shadow-lg md:block md:overflow-y-auto md:pb-8">
        <div className="pl-6 pt-6">
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
                  ? 'bg-blue-50 text-base  text-blue-600 border-r-2 border-blue-600'
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
      <div className="flex-1 md:ml-64 pt-20 px-4 md:px-8 pb-20">
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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden flex justify-around items-center py-2 z-50">
        {bottomTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex flex-col items-center text-sm ${
              activeSection === tab.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[12px]">{tab.name}</span>
          </button>
        ))}

        {/* "More" Dropdown for extra tabs */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col items-center text-gray-500"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[12px]">More</span>
          </button>
          {menuOpen && (
            <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-40">
              {extraTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id)
                    setMenuOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    activeSection === tab.id ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
