// components/dashboard/ResumeSection.tsx
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"
import ResumeWizard from "./resume/ResumeWizard"
import CVWizard from "./cv/CVWizard"
import type { TemplateId, SectionToggles, SelectedItems } from "@/lib/resumeTemplates"
import type { CVTemplateId, CVSectionToggles, ActiveDocumentType } from "@/lib/cvTemplates"

interface ResumeRow {
  resume_url: string | null
  cv_url?: string | null
  active_document?: ActiveDocumentType | null
}

export default function ResumeSection({ user }: { user: any }) {
  const [resumeUrl, setResumeUrl] = useState<string>("")
  const [cvUrl, setCvUrl] = useState<string>("")
  const [activeDoc, setActiveDoc] = useState<ActiveDocumentType>("resume")

  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState("")
  const [missingSections, setMissingSections] = useState<string[]>([])

  const [showResumeWizard, setShowResumeWizard] = useState(false)
  const [showCVWizard, setShowCVWizard] = useState(false)

  // Profile Data for wizards
  const [profileData, setProfileData] = useState<any>(null)
  const [aboutData, setAboutData] = useState<any>(null)
  const [skillsData, setSkillsData] = useState<any>(null)
  const [projectsData, setProjectsData] = useState<any>(null)
  const [contactData, setContactData] = useState<any>(null)
  const [langintData, setLangintData] = useState<any>(null)
  const [certificatesData, setCertificatesData] = useState<any[]>([])

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  useEffect(() => {
    if (user?.id) fetchDocumentData()
  }, [user])

  const fetchDocumentData = async () => {
    try {
      const res = await fetch(`/api/user/save-document?userId=${user.id}`)
      const json = await res.json()
      if (json.success && json.data) {
        if (json.data.resume_url) setResumeUrl(json.data.resume_url)
        if (json.data.cv_url) setCvUrl(json.data.cv_url)
        if (json.data.active_document) setActiveDoc(json.data.active_document)
      } else {
        // Fallback to client query if endpoint failed
        const { data } = await supabase
          .from("resumes")
          .select("*")
          .eq("auth_user_id", user.id)
          .maybeSingle<ResumeRow>()
        if (data?.resume_url) setResumeUrl(data.resume_url)
        if (data?.cv_url) setCvUrl(data.cv_url)
        if (data?.active_document) setActiveDoc(data.active_document)
      }
    } catch (err) {
      console.error("Fetch document data error:", err)
    }
  }

  const checkProfileCompleteness = async (): Promise<boolean> => {
    const missing: string[] = []
    const [
      { data: profile, error: profileError },
      { data: about, error: aboutError },
      { data: skills, error: skillsError },
      { data: projects, error: projectsError },
      { data: contact, error: contactError },
      { data: langint, error: langintError }
    ] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("uid", user.id).single(),
      supabase.from("about").select("*").eq("auth_user_id", user.id).single(),
      supabase.from("skills").select("*").eq("auth_user_id", user.id).single(),
      supabase.from("project").select("*").eq("id", user.id).single(),
      supabase.from("contact").select("*").eq("auth_user_id", user.id).single(),
      supabase.from("langint").select("*").eq("auth_user_id", user.id).single(),
    ])

    if (profileError || !profile) missing.push("Profile")
    if (aboutError || !about) missing.push("About")
    if (skillsError || !skills) missing.push("Skills")
    if (projectsError || !projects) missing.push("Projects")
    if (contactError || !contact) missing.push("Contact")
    if (langintError || !langint) missing.push("Languages & Interests")

    if (profile) setProfileData(profile)
    if (about) setAboutData(about)
    if (skills) {
      setSkillsData(skills)
      setCertificatesData(skills.certificates ?? [])
    }
    if (projects) setProjectsData(projects)
    if (contact) setContactData(contact)
    if (langint) setLangintData(langint)

    if (missing.length > 0) {
      setMissingSections(missing)
      setMessage("Please complete all sections of your profile before generating documents.")
      return false
    }
    return true
  }

  const handleActiveDocSwap = async (docType: ActiveDocumentType) => {
    setActiveDoc(docType)
    try {
      await fetch('/api/user/active-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, activeDocument: docType }),
      })
      setMessage(`Active portfolio document set to ${docType.toUpperCase()}`)
    } catch (err) {
      console.error("Failed to swap active document:", err)
    }
  }

  const saveResumeToDB = async (url: string) => {
    setResumeUrl(url)
    try {
      const res = await fetch('/api/user/save-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resumeUrl: url,
          cvUrl: cvUrl || undefined,
          activeDocument: activeDoc,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.details || json.error || 'Save document API error')
      if (json.data?.resume_url) setResumeUrl(json.data.resume_url)
      if (json.data?.cv_url) setCvUrl(json.data.cv_url)
    } catch (err) {
      console.error('Save resume to DB API error, trying fallback:', err)
      const { error } = await supabase.from("resumes").upsert(
        {
          auth_user_id: user.id,
          resume_url: url,
          cv_url: cvUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'auth_user_id' }
      )
      if (error) {
        console.error('Fallback resume save failed:', error)
        setMessage('Resume generated but failed to save. Please try again.')
        throw error
      }
    }
  }

  const saveCVToDB = async (url: string) => {
    setCvUrl(url)
    try {
      const res = await fetch('/api/user/save-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resumeUrl: resumeUrl || undefined,
          cvUrl: url,
          activeDocument: activeDoc,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.details || json.error || 'Save CV API error')
      if (json.data?.resume_url) setResumeUrl(json.data.resume_url)
      if (json.data?.cv_url) setCvUrl(json.data.cv_url)
    } catch (err) {
      console.error('Save CV to DB API error, trying fallback:', err)
      const { error } = await supabase.from("resumes").upsert(
        {
          auth_user_id: user.id,
          resume_url: resumeUrl || null,
          cv_url: url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'auth_user_id' }
      )
      if (error) {
        console.error('Fallback CV save failed:', error)
        setMessage('CV generated but failed to save. Please try again.')
        throw error
      }
    }
  }

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!data.secure_url) throw new Error("Upload failed")
      await saveResumeToDB(data.secure_url)
      setMessage("Resume uploaded successfully!")
    } catch (err) {
      setMessage("Error uploading resume")
    } finally {
      setUploading(false)
    }
  }

  const handleCVFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!data.secure_url) throw new Error("Upload failed")
      await saveCVToDB(data.secure_url)
      setMessage("CV uploaded successfully!")
    } catch (err) {
      setMessage("Error uploading CV")
    } finally {
      setUploading(false)
    }
  }

  const startResumeWizard = async () => {
    setMessage("")
    setMissingSections([])
    const isComplete = await checkProfileCompleteness()
    if (isComplete) {
      setShowCVWizard(false)
      setShowResumeWizard(true)
    }
  }

  const startCVWizard = async () => {
    setMessage("")
    setMissingSections([])
    const isComplete = await checkProfileCompleteness()
    if (isComplete) {
      setShowResumeWizard(false)
      setShowCVWizard(true)
    }
  }

  const handleResumeGenerate = async (
    template: TemplateId,
    sections: SectionToggles,
    selectedItems: SelectedItems
  ) => {
    setGenerating(true)
    setMessage("")
    try {
      const response = await fetch('/api/generate-resume', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          template, sections, selectedItems,
          profile: profileData, about: aboutData, skills: skillsData,
          projects: projectsData, contact: contactData, langint: langintData,
          certificates: certificatesData,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.resumeUrl) throw new Error(data.error || "Generation failed")
      await saveResumeToDB(data.resumeUrl)
      setMessage("Resume generated successfully!")
      setShowResumeWizard(false)
    } catch (err) {
      setMessage("Error generating resume")
    } finally {
      setGenerating(false)
    }
  }

  const handleCVGenerate = async (
    template: CVTemplateId,
    sections: CVSectionToggles,
    selectedItems: SelectedItems
  ) => {
    setGenerating(true)
    setMessage("")
    try {
      const response = await fetch('/api/generate-cv', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          template, sections, selectedItems,
          profile: profileData, about: aboutData, skills: skillsData,
          projects: projectsData, contact: contactData, langint: langintData,
          certificates: certificatesData,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.cvUrl) throw new Error(data.error || "CV Generation failed")
      await saveCVToDB(data.cvUrl)
      setMessage("CV generated successfully!")
      setShowCVWizard(false)
    } catch (err) {
      setMessage("Error generating CV")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management Center</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and toggle between your Resume & CV on your public portfolio page.
          </p>
        </div>

        {/* Portfolio Document Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1 border border-gray-200 self-start md:self-auto">
          <button
            onClick={() => handleActiveDocSwap("resume")}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeDoc === "resume"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Show Resume on Portfolio
          </button>
          <button
            onClick={() => handleActiveDocSwap("cv")}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeDoc === "cv"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Show CV on Portfolio
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 font-medium text-sm ${
          message.includes("Error") || message.includes("Please")
            ? "bg-red-50 text-red-700 border border-red-200"
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {message}
          {missingSections.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-xs">
              {missingSections.map((sec) => (
                <li key={sec}>{sec} section is missing or incomplete</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Resume Wizard Modal View */}
      {showResumeWizard ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Resume Builder Wizard</h3>
            <button
              onClick={() => setShowResumeWizard(false)}
              className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              ✕ Close Wizard
            </button>
          </div>
          <ResumeWizard
            about={aboutData}
            skills={skillsData}
            projects={projectsData}
            contact={contactData}
            langint={langintData}
            certificates={certificatesData}
            onGenerate={handleResumeGenerate}
            onCancel={() => setShowResumeWizard(false)}
            generating={generating}
          />
        </div>
      ) : showCVWizard ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">CV Builder Wizard</h3>
            <button
              onClick={() => setShowCVWizard(false)}
              className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              ✕ Close Wizard
            </button>
          </div>
          <CVWizard
            about={aboutData}
            skills={skillsData}
            projects={projectsData}
            contact={contactData}
            langint={langintData}
            certificates={certificatesData}
            onGenerate={handleCVGenerate}
            onCancel={() => setShowCVWizard(false)}
            generating={generating}
          />
        </div>
      ) : null}

      {/* Document Grid (Resume & CV Cards) */}
      {!showResumeWizard && !showCVWizard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RESUME CARD */}
          <div className={`border-2 rounded-2xl p-5 sm:p-6 transition-all flex flex-col justify-between ${
            activeDoc === "resume" ? "border-purple-500 bg-purple-50/20" : "border-gray-200 bg-white"
          }`}>
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">Resume</h3>
                    <p className="text-xs text-gray-500 truncate">Concise 1-page professional summary</p>
                  </div>
                </div>
                {activeDoc === "resume" && (
                  <span className="bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 self-start mt-0.5">
                    Active on Portfolio
                  </span>
                )}
              </div>

              {resumeUrl ? (
                <div className="bg-gray-50 p-3.5 rounded-xl mb-4 border border-gray-200 flex justify-between items-center">
                  <div className="truncate max-w-[170px]">
                    <p className="text-xs font-semibold text-gray-800 truncate">Resume.pdf</p>
                    <p className="text-[11px] text-green-600 font-medium">Ready & Saved</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      View
                    </a>
                    <label className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleResumeFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl mb-4 text-center border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500">No Resume generated or uploaded yet</p>
                </div>
              )}
            </div>

            <button
              onClick={startResumeWizard}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Build / Customize Resume</span>
            </button>
          </div>

          {/* CV CARD */}
          <div className={`border-2 rounded-2xl p-5 sm:p-6 transition-all flex flex-col justify-between ${
            activeDoc === "cv" ? "border-purple-500 bg-purple-50/20" : "border-gray-200 bg-white"
          }`}>
            <div>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">Curriculum Vitae (CV)</h3>
                    <p className="text-xs text-gray-500 truncate">Detailed academic & editorial layout</p>
                  </div>
                </div>
                {activeDoc === "cv" && (
                  <span className="bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 self-start mt-0.5">
                    Active on Portfolio
                  </span>
                )}
              </div>

              {cvUrl ? (
                <div className="bg-gray-50 p-3.5 rounded-xl mb-4 border border-gray-200 flex justify-between items-center">
                  <div className="truncate max-w-[170px]">
                    <p className="text-xs font-semibold text-gray-800 truncate">Curriculum_Vitae.pdf</p>
                    <p className="text-[11px] text-green-600 font-medium">Ready & Saved</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      View
                    </a>
                    <label className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleCVFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl mb-4 text-center border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500">No CV generated or uploaded yet</p>
                </div>
              )}
            </div>

            <button
              onClick={startCVWizard}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Build / Customize CV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}