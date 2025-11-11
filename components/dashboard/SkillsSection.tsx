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

  // Supabase returns arrays/objects already
  const technicalSkills = Array.isArray(skillsData.technical) ? skillsData.technical : []
  const softSkills = Array.isArray(skillsData.soft) ? skillsData.soft : []

  // Certificates are saved as an array of objects (see builder form)
  const certificates = Array.isArray(skillsData.certificates) ? skillsData.certificates : []

  // Helpers
// --- Helpers (put above the return) ---
const isPdf = (m: any) => {
  const fmt = String(m?.format || "").toLowerCase();
  const url = String(m?.url || "").toLowerCase();
  // Treat as PDF if format says pdf OR url ends with .pdf
  return fmt === "pdf" || url.endsWith(".pdf");
};

const isImage = (m: any) => {
  // If it's a PDF, it's not an image (even if resource_type === "image")
  if (isPdf(m)) return false;
  const rt = String(m?.resource_type || "").toLowerCase();
  const url = String(m?.url || "").toLowerCase();
  return rt === "image" || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(url);
};

const fileLabel = (m: any) => {
  const fmt = String(m?.format || "").toUpperCase();
  if (fmt) return fmt;
  const url = String(m?.url || "");
  const last = url.split("/").pop() || "FILE";
  return last.length > 24 ? last.slice(0, 21) + "..." : last;
};


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
                key={skill.id || skill.name}
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
                    {skill.category?.toString().replace('_', ' ')}
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
      <div className="mb-8">
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

      {/* Certificates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificates</h3>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {certificates.map((cert: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {cert.name || 'Certificate'}
                      </h4>
                      {cert.organization && (
                        <p className="text-sm text-gray-600">{cert.organization}</p>
                      )}
                    </div>
                    {cert.issue_date && (
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(cert.issue_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Credential details */}
                  {(cert.credential_id || cert.credential_url) && (
                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                      {cert.credential_id && (
                        <div>
                          <span className="text-gray-500">ID: </span>
                          <span className="font-medium">{cert.credential_id}</span>
                        </div>
                      )}
                      {cert.credential_url && (
                        <div className="truncate">
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            Verify Credential
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Related skills (chips with logos) */}
                {Array.isArray(cert.skills) && cert.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Related skills</div>
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((s: any, i: number) => (
                        <span
                          key={`${s?.source || 'skill'}-${s?.name || i}-${i}`}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                        >
                          {s?.logo_url ? (
                            <img
                              src={s.logo_url}
                              alt={s?.name || 'skill'}
                              className="w-4 h-4 rounded object-contain"
                            />
                          ) : null}
                          <span className="font-medium">{s?.name || 'Skill'}</span>
                          {s?.source && (
                            <span className="text-[10px] uppercase tracking-wide text-gray-500">
                              {s.source}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media */}
               
                {Array.isArray(cert.media) && cert.media.length > 0 ? (
                  <div className="mt-auto">
                     <div className="text-sm text-gray-600 mb-2">Attachments</div>
    <div className="grid grid-cols-2 gap-3">
      {cert.media.map((m: any, i: number) => (
        <div key={i} className="border rounded-md p-2 bg-gray-50">
          {/* If image -> show image; if PDF -> show pdf.png; else -> fallback chip */}
          {isImage(m) ? (
            <a href={m?.url} target="_blank" rel="noreferrer" className="block">
              <img
                src={m?.url}
                alt={fileLabel(m)}
                className="w-full h-28 object-cover rounded"
              />
            </a>
          ) : isPdf(m) ? (
            <a href={m?.url} target="_blank" rel="noreferrer" className="block">
              <img
                src="/pdf.png"
                alt={fileLabel(m)}
                className="w-full h-28 object-contain rounded bg-white"
              />
            </a>
          ) : (
            <a
              href={m?.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full h-28 rounded bg-white text-sm text-blue-700 underline"
            >
              {fileLabel(m)}
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="text-sm text-gray-500">No attachments.</div>
)}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            No certificates added yet.
          </div>
        )}
      </div>
    </div>
  )
}
