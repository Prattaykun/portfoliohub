"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

interface LanguageInterestProps {
  user: any
}

interface LanguageEntry {
  id: string
  name: string
  proficiency: string
}

export default function LanguageInterest({ user }: LanguageInterestProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<{ languages: LanguageEntry[]; interests: string[] }>({
    languages: [],
    interests: []
  })
  const [newLang, setNewLang] = useState({ name: "", proficiency: "Beginner" })
  const [newInterest, setNewInterest] = useState("")
  const [message, setMessage] = useState("")

  const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"]

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("langint")
        .select("language, interest")
        .eq("auth_user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") throw error
      if (data) {
        setData(data)
        setFormData({
          languages: data.language || [],
          interests: data.interest || []
        })
      }
    } catch (err) {
      console.error("Error fetching language & interest:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("langint").upsert({
        auth_user_id: user.id,
        language: formData.languages,
        interest: formData.interests,
        updated_at: new Date().toISOString()
      })

      if (error) throw error
      setData({ language: formData.languages, interest: formData.interests })
      setEditing(false)
      setMessage("Language and interest information updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setMessage("Error saving data")
    }
  }

  const handleCancel = () => {
    setFormData({
      languages: data?.language || [],
      interests: data?.interest || []
    })
    setEditing(false)
    setMessage("")
  }

  const addLanguage = () => {
    if (!newLang.name.trim()) {
      setMessage("Enter a language name")
      return
    }
    const newEntry = { id: `lang-${Date.now()}`, ...newLang }
    setFormData({ ...formData, languages: [...formData.languages, newEntry] })
    setNewLang({ name: "", proficiency: "Beginner" })
  }

  const removeLanguage = (index: number) => {
    const updated = formData.languages.filter((_, i) => i !== index)
    setFormData({ ...formData, languages: updated })
  }

  const addInterest = () => {
    if (!newInterest.trim()) {
      setMessage("Enter a hobby or interest")
      return
    }
    setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] })
    setNewInterest("")
  }

  const removeInterest = (index: number) => {
    const updated = formData.interests.filter((_, i) => i !== index)
    setFormData({ ...formData, interests: updated })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
  <div className="bg-neutral-100 text-neutral-900 rounded-lg shadow-lg p-6 dark:bg-neutral-800 dark:text-neutral-100 transition-colors duration-300">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Languages & Interests</h2>
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit
        </button>
      ) : (
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>

    {message && (
      <div
        className={`mb-6 p-3 rounded-lg ${
          message.includes("Error")
            ? "bg-red-500/10 text-red-600 border border-red-500/30"
            : "bg-green-500/10 text-green-600 border border-green-500/30"
        }`}
      >
        {message}
      </div>
    )}

    {/* LANGUAGES SECTION */}
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b border-neutral-400 pb-2">
        Languages
      </h3>

      {editing ? (
        <>
          {formData.languages.map((lang, i) => (
            <div
              key={lang.id}
              className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0 p-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
            >
              <input
                type="text"
                value={lang.name}
                onChange={(e) => {
                  const updated = [...formData.languages]
                  updated[i].name = e.target.value
                  setFormData({ ...formData, languages: updated })
                }}
                placeholder="Language name"
                className="flex-1 px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
              />
              <select
                value={lang.proficiency}
                onChange={(e) => {
                  const updated = [...formData.languages]
                  updated[i].proficiency = e.target.value
                  setFormData({ ...formData, languages: updated })
                }}
                className="px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                {proficiencyLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <button
                onClick={() => removeLanguage(i)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 mt-3">
            <input
              type="text"
              placeholder="Add new language"
              value={newLang.name}
              onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
            />
            <select
              value={newLang.proficiency}
              onChange={(e) => setNewLang({ ...newLang, proficiency: e.target.value })}
              className="px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {proficiencyLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <button
              onClick={addLanguage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {data?.language?.length ? (
            data.language.map((lang: LanguageEntry) => (
              <li key={lang.id}>
                <span className="font-medium">{lang.name}</span> — {lang.proficiency}
              </li>
            ))
          ) : (
            <p className="text-neutral-500">No languages added yet.</p>
          )}
        </ul>
      )}
    </div>

    {/* INTERESTS SECTION */}
    <div className="mt-10 space-y-6">
      <h3 className="text-lg font-semibold border-b border-neutral-400 pb-2">
        Hobbies & Interests
      </h3>

      {editing ? (
        <>
          <div className="space-y-3">
            {formData.interests.map((interest, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
              >
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => {
                    const updated = [...formData.interests]
                    updated[i] = e.target.value
                    setFormData({ ...formData, interests: updated })
                  }}
                  className="flex-1 px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
                />
                <button
                  onClick={() => removeInterest(i)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 mt-3">
            <input
              type="text"
              placeholder="Add new hobby or interest"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 px-3 py-2 border border-neutral-400 rounded focus:ring-2 focus:ring-blue-500 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
            />
            <button
              onClick={addInterest}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {data?.interest?.length ? (
            data.interest.map((i: string, idx: number) => <li key={idx}>{i}</li>)
          ) : (
            <p className="text-neutral-500">No interests added yet.</p>
          )}
        </ul>
      )}
    </div>
  </div>
)

}
