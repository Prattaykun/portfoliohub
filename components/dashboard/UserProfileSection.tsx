'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

interface UserProfileSectionProps {
  user: any
  userProfile: any
}

export default function UserProfileSection({ user, userProfile }: UserProfileSectionProps) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchedUsername, setFetchedUsername] = useState<string | null>(null)

  const currentUsername = userProfile?.username ?? user?.email?.split('@')[0] ?? 'Not set'

  useEffect(() => {
    // Load username from users_usernames table for this auth user
    const loadUsername = async () => {
      try {
        if (!user?.id) return
        const { data } = await supabase
          .from('users_usernames')
          .select('username')
          .eq('auth_user_id', user.id)
          .limit(1)

        const found = Array.isArray(data) ? data[0]?.username : null
        setFetchedUsername(found ?? null)
      } catch (err) {
        console.error('Failed to fetch username:', err)
        setFetchedUsername(null)
      }
    }

    loadUsername()
  }, [user?.id])

  // ✅ Case-sensitive username check
  const checkUsername = async (username: string) => {
    const { data, error } = await supabase
      .from('users_usernames')
      .select('username')
      .eq('username', username) // case-sensitive
      .single()

    return { exists: !!data, error }
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!username.trim()) {
      setMessage('Please enter a username')
      setLoading(false)
      return
    }

    // Check if username exists (case-sensitive)
    const { exists } = await checkUsername(username)
    if (exists) {
      setMessage('Username already taken')
      setLoading(false)
      return
    }

    // ✅ Upsert username with original casing preserved
    const { error } = await supabase
      .from('users_usernames')
      .upsert({
        auth_user_id: user.id,
        username: username,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setMessage('Error updating username')
    } else {
      setMessage('Username updated successfully!')
      setUsername('')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        <Link
          href="/profile-form"
          className="px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition"
        >
          Edit Profile
        </Link>
      </div>
      
      {/* Current Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-lg text-gray-900">{userProfile.full_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(userProfile.date_of_birth).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <p className="mt-1 text-lg text-gray-900">{userProfile.gender}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <p className="mt-1 text-lg text-gray-900">{userProfile.nationality}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pronouns</label>
            <p className="mt-1 text-lg text-gray-900">{userProfile.pronouns}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Locale</label>
            <p className="mt-1 text-lg text-gray-900">{userProfile.locale}</p>
          </div>
        </div>
      </div>

      {/* Profile Photo */}
      {userProfile.photo_url && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <img
            src={userProfile.photo_url}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
          />
        </div>
      )}

      {/* Username Update Form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Username</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Current username</label>
          <p className="mt-1 text-lg text-gray-900">{fetchedUsername ?? currentUsername}</p>
        </div>
        <form onSubmit={handleUsernameUpdate} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter unique username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
