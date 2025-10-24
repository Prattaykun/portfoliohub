"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function SkillsSection({ user }: { user: any }) {
  const [skillsData, setSkillsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchSkillsData()
    }
  }, [user])

  const fetchSkillsData = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/skill-form')
        return
      }

      setSkillsData(data)
    } catch (error) {
      console.error('Error fetching skills data:', error)
      router.push('/skill-form')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!skillsData) return <div>No skills data found</div>

  // No need to parse JSON - Supabase already returns objects/arrays
  const technicalSkills = Array.isArray(skillsData.technical) ? skillsData.technical : []
  const softSkills = Array.isArray(skillsData.soft) ? skillsData.soft : []

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Skills</h2>
        <button
          onClick={() => router.push('/skill-form')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Technical Skills */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Skills</h3>
        {technicalSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicalSkills.map((skill: any) => (
              <div
                key={skill.id}
                className="border rounded-lg p-4 flex items-center space-x-3 hover:shadow-md transition-shadow"
              >
                {skill.logo_url && (
                  <img
                    src={skill.logo_url}
                    alt={skill.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-800">{skill.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {skill.category?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No technical skills added yet.</p>
        )}
      </div>

      {/* Soft Skills */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Soft Skills</h3>
        {softSkills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {softSkills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No soft skills added yet.</p>
        )}
      </div>
    </div>
  )
}