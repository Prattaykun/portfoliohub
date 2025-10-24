"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"

interface ResumeRow {
  resume_url: string | null
}

export default function ResumeSection({ user }: { user: any }) {
  const [resumeUrl, setResumeUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState("")
  const [missingSections, setMissingSections] = useState<string[]>([])

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

  useEffect(() => {
    if (user?.id) fetchResumeData()
  }, [user])

  const fetchResumeData = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("resume_url")
      .eq("auth_user_id", user.id)
      .maybeSingle<ResumeRow>()

    if (error) {
      console.error(error)
      setMessage("Error fetching resume data")
      return
    }

    if (data?.resume_url) setResumeUrl(data.resume_url)
  }

  const checkProfileCompleteness = async (): Promise<{ isComplete: boolean; missingSections: string[] }> => {
    const missing: string[] = []

    // Check user_profiles
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("uid", user.id)
      .single()

    if (profileError || !profile) {
      missing.push("Profile")
    } else {
      // Check essential profile fields
      if (!profile.full_name || !profile.profession || !profile.email) {
        missing.push("Profile (complete your name, profession, and email)")
      }
    }

    // Check about
    const { data: about, error: aboutError } = await supabase
      .from("about")
      .select("*")
      .eq("auth_user_id", user.id)
      .single()

    if (aboutError || !about || !about.about) {
      missing.push("About")
    }

    // Check skills
    const { data: skills, error: skillsError } = await supabase
      .from("skills")
      .select("*")
      .eq("auth_user_id", user.id)
      .single()

    if (skillsError || !skills) {
      missing.push("Skills")
    } else {
      // Check if skills array is populated
      if (!skills.skills || skills.skills.length === 0) {
        missing.push("Skills (add at least one skill)")
      }
    }

    // Check projects
    const { data: projects, error: projectsError } = await supabase
      .from("project")
      .select("*")
      .eq("id", user.id)
      .single()

    if (projectsError || !projects) {
      missing.push("Projects")
    } else {
      // Check essential project fields
      if (!projects.project_name || !projects.project_description) {
        missing.push("Projects (add project name and description)")
      }
    }

    // Check contact
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select("*")
      .eq("auth_user_id", user.id)
      .single()

    if (contactError || !contact) {
      missing.push("Contact")
    } else {
      // Check if at least one contact method is provided
      if (!contact.email && !contact.phone && !contact.linkedin && !contact.github) {
        missing.push("Contact (add at least one contact method)")
      }
    }

    // Check langint (languages & interests)
    const { data: langint, error: langintError } = await supabase
      .from("langint")
      .select("*")
      .eq("auth_user_id", user.id)
      .single()

    if (langintError || !langint) {
      missing.push("Languages & Interests")
    } else {
      // Check if at least one language or interest is provided
      if ((!langint.languages || langint.languages.length === 0) && 
          (!langint.interests || langint.interests.length === 0)) {
        missing.push("Languages & Interests (add at least one language or interest)")
      }
    }

    return {
      isComplete: missing.length === 0,
      missingSections: missing
    }
  }

  const saveResumeToDB = async (url: string) => {
    const { error } = await supabase
      .from("resumes")
      .upsert({
        auth_user_id: user.id,
        resume_url: url,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
    setResumeUrl(url)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as { secure_url?: string; error?: any }

      if (!data.secure_url) throw new Error("Cloudinary upload failed")

      await saveResumeToDB(data.secure_url)
      setMessage("Resume uploaded successfully!")
    } catch (err) {
      console.error(err)
      setMessage("Error uploading resume")
    } finally {
      setUploading(false)
    }
  }

  const generateResume = async () => {
    setGenerating(true)
    setMessage("")

    try {
      // First check if profile is complete
      const completenessCheck = await checkProfileCompleteness()
      
      if (!completenessCheck.isComplete) {
        setMissingSections(completenessCheck.missingSections)
        setMessage("Please complete all sections of your profile before generating a resume.")
        return
      }

      // ✅ Fetch all data from Supabase directly on client side
      const [
        { data: profile },
        { data: about },
        { data: skills },
        { data: projects },
        { data: contact },
        { data: langint }
      ] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("uid", user.id).single(),
        supabase.from("about").select("*").eq("auth_user_id", user.id).single(),
        supabase.from("skills").select("*").eq("auth_user_id", user.id).single(),
        supabase.from("project").select("*").eq("id", user.id).single(),
        supabase.from("contact").select("*").eq("auth_user_id", user.id).single(),
        supabase.from("langint").select("*").eq("auth_user_id", user.id).single(),
      ])

      if (!profile || !about || !contact) throw new Error("Incomplete data for resume generation")

      // ✅ Include langint
      const payload = { profile, about, skills, projects, contact, langint }

      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok || !data.resumeUrl) throw new Error(data.error || "Generation failed")

      await saveResumeToDB(data.resumeUrl)
      setMessage("Resume generated successfully!")
      setMissingSections([]) // Clear missing sections on success
    } catch (err) {
      console.error(err)
      setMessage("Error generating resume")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Management</h2>

      {/* Current Resume */}
      {resumeUrl ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Resume</h3>
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-700 truncate max-w-xs">Resume.pdf</p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View
              </a>
              <label
                htmlFor="resume-replace"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 cursor-pointer"
              >
                Replace
                <input
                  type="file"
                  id="resume-replace"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-600 mb-3">No resume found. Upload or generate one below.</p>
        </div>
      )}

      {/* Generate Resume */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Generate Resume</h3>
        <p className="text-gray-600 mb-4">
          Generate a professional resume from your portfolio data.
        </p>
        
        {/* Missing Sections Warning */}
        {missingSections.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Complete your profile to generate resume
            </h4>
            <ul className="list-disc list-inside text-yellow-700 text-sm">
              {missingSections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
            <p className="text-yellow-600 text-sm mt-2">
              Please go to your dashboard and fill out all the required sections.
            </p>
          </div>
        )}

        <button
          onClick={generateResume}
          disabled={generating}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Resume PDF"}
        </button>
      </div>

      {/* Upload Resume */}
      {!resumeUrl && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Upload Resume</h3>
          <p className="text-gray-600 mb-4">Or upload your own resume file (PDF recommended)</p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-block"
            >
              {uploading ? "Uploading..." : "Choose File"}
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes("Error") || message.includes("complete") 
              ? "text-red-600" 
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}