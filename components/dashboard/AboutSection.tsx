'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AboutSection({ user }: { user: any }) {
  const [aboutData, setAboutData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAboutData()
  }, [user])

  const fetchAboutData = async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    console.log('About data from Supabase:', data) // Debug log
    console.log('Education type:', typeof data?.education) // Debug log
    console.log('Education value:', data?.education) // Debug log

    if (error || !data) {
      router.push('/about-form')
      return
    }

    setAboutData(data)
    setLoading(false)
  }

  // Safe data parsing function
  const parseData = (data: any) => {
    if (!data) return []
    
    console.log('Parsing data:', data) // Debug log
    
    // If it's already an array, return it
    if (Array.isArray(data)) return data
    
    // If it's a string, try to parse it
    if (typeof data === 'string') {
      try {
        return JSON.parse(data)
      } catch (error) {
        console.error('Error parsing JSON:', error)
        return []
      }
    }
    
    // If it's an object but not an array, wrap it in an array
    if (typeof data === 'object' && data !== null) {
      return [data]
    }
    
    return []
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!aboutData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No about data found</p>
          <button
            onClick={() => router.push('/about-form')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add About Information
          </button>
        </div>
      </div>
    )
  }

  const educationData = parseData(aboutData.education)
  const experienceData = parseData(aboutData.experience)
  const rolesData = parseData(aboutData.roles)

  console.log('Parsed education:', educationData) // Debug log
  console.log('Parsed experience:', experienceData) // Debug log

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">About & Experience</h2>
        <button
          onClick={() => router.push('/about-form')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Edit
        </button>
      </div>

      {/* Roles */}
      {rolesData && rolesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Roles</h3>
          <div className="flex flex-wrap gap-2">
            {rolesData.map((role: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bio</h3>
        <p className="text-gray-700 leading-relaxed">
          {aboutData.bio || 'No bio added yet.'}
        </p>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Education</h3>
        {educationData.length > 0 ? (
          <div className="space-y-4">
            {educationData.map((edu: any, index: number) => (
              <div key={edu.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Education Institution Logo */}
                  {edu.logo && (
                    <div className="flex-shrink-0">
                      <img
                        src={edu.logo}
                        alt={edu.institution}
                        className="w-12 h-12 rounded-lg object-contain border"
                        onError={(e) => {
                          // Fallback if logo fails to load
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{edu.degree || 'No degree specified'}</h4>
                        <p className="text-gray-600 font-medium">{edu.institution || 'No institution specified'}</p>
                      </div>
                      {edu.domain && (
                        <a
                          href={edu.domain.startsWith('http') ? edu.domain : `https://${edu.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm ml-2"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.pursuing ? 'Present' : (edu.endYear || 'Present')}
                      </p>
                      
                      {edu.grade && (
                        <p className="text-sm text-gray-600">
                          Grade: {edu.grade}/{edu.gradeScale || '10'}
                        </p>
                      )}
                      
                      {edu.level && (
                        <p className="text-sm text-gray-500 capitalize">
                          {edu.level.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No education information added yet.</p>
        )}
      </div>

      {/* Experience */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience</h3>
        {experienceData.length > 0 ? (
          <div className="space-y-6">
            {experienceData.map((exp: any, index: number) => (
              <div key={exp.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      {/* Company Logo */}
                      {exp.logo && (
                        <img
                          src={exp.logo}
                          alt={exp.company}
                          className="w-10 h-10 rounded object-contain flex-shrink-0 border"
                          onError={(e) => {
                            // Fallback if logo fails to load
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{exp.title || 'No title specified'}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-gray-600 font-medium">{exp.company || 'No company specified'}</p>
                          {exp.companyUrl && (
                            <a
                              href={exp.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 whitespace-nowrap ml-4">
                    {exp.start} - {exp.present ? 'Present' : (exp.end || 'Present')}
                  </div>
                </div>
                
                {exp.description && (
                  <p className="text-gray-700 mb-3">{exp.description}</p>
                )}
                
                {exp.skills && exp.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exp.skills.map((skill: string, skillIndex: number) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {exp.offerLetter && (
                  <div className="mt-3">
                    <a
                      href={exp.offerLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <span>View Offer Letter</span>
                      <span>→</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No experience information added yet.</p>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-8 pt-6 border-t text-sm text-gray-500">
        Last updated: {new Date(aboutData.updated_at).toLocaleDateString()}
      </div>
    </div>
  )
}