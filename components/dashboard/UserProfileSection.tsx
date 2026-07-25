'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { getUsernameValidationError } from '../../lib/reservedUsernames'
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from 'next-cloudinary'

interface UserProfileSectionProps {
  user: any
  userProfile: any
  secure_url?: string
}

export default function UserProfileSection({ user, userProfile }: UserProfileSectionProps) {
  const [username, setUsername] = useState('')
  const [chatbotInfo, setChatbotInfo] = useState('')
  const [message, setMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(false)
  const [fetchedUsername, setFetchedUsername] = useState<string | null>(null)
  const [signatureUrl, setSignatureUrl] = useState<string | null>(userProfile?.signature ?? null)
  const [sigMessage, setSigMessage] = useState<string>('')

  const currentUsername = userProfile?.username ?? user?.email?.split('@')[0] ?? 'Not set'

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!user?.id) return
        const { data } = await supabase
          .from('users_usernames')
          .select('username, chatbot_info')
          .eq('auth_user_id', user.id)
          .limit(1)

        const found = Array.isArray(data) ? data[0] : null
        setFetchedUsername(found?.username ?? null)
        setChatbotInfo(found?.chatbot_info ?? '')
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        setFetchedUsername(null)
      }
    }

    loadUserData()
  }, [user?.id])

  const checkUsername = async (username: string) => {
    const { data, error } = await supabase
      .from('users_usernames')
      .select('username')
      .eq('username', username)
      .single()

    return { exists: !!data, error }
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const valErr = getUsernameValidationError(username)
    if (valErr) {
      setMessage(valErr)
      setLoading(false)
      return
    }

    const { exists } = await checkUsername(username)
    if (exists) {
      setMessage('Username already taken')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('users_usernames')
      .upsert({
        auth_user_id: user.id,
        username: username,
        updated_at: new Date().toISOString()
      }, { onConflict: 'auth_user_id' })

    if (error) {
      setMessage('Error updating username')
    } else {
      setMessage('Username updated successfully!')
      setFetchedUsername(username)
      setUsername('')
    }
    setLoading(false)
  }

  const handleChatbotInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setInfoLoading(true)
    setInfoMessage('')

    const wordCount = chatbotInfo.trim().split(/\s+/).length
    if (wordCount > 200) {
      setInfoMessage(`Text exceeds 200 words (currently ${wordCount})`)
      setInfoLoading(false)
      return
    }

    // Upsert needs to handle preserving existing username if we are only updating info
    // However, users_usernames is keyed by auth_user_id.
    // If we rely on upsert, we need to make sure we don't accidentally clear the username if it's not provided.
    // Ideally we should use UPDATE if the record exists.
    
    // First check if record exists to decide Update vs Upsert, or just use upsert with all fields if possible.
    // Safer: Update only. If row doesn't exist, we must create it (but that implies setting username).
    // Assuming row exists because profile section loads. If not, user should set username first usually.
    // But let's attempt an UPSERT with auth_user_id. Supabase upsert merges if we don't specify fields to ignore?
    // Actually, to be safe, let's just update the specific field for the user.
    
    const { error } = await supabase
      .from('users_usernames')
      .update({
        chatbot_info: chatbotInfo,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.id)

    if (error) {
       // If update fails (e.g. no row), we might need upsert, but we need a username for that constraint usually?
       // Let's assume the user has a record if they are seeing this, or logic elsewhere handles creation.
       // Actually, users_usernames availability is key. 
       // If no username set, this table might be empty.
       // We can try UPSERT with just auth_user_id and chatbot_info?
       // Constraints: username is unique but nullable in schema provided? "username text null"
       // Primary key is auth_user_id. So upsert on auth_user_id works.
       const { error: upsertError } = await supabase
        .from('users_usernames')
        .upsert({
            auth_user_id: user.id,
            chatbot_info: chatbotInfo,
            updated_at: new Date().toISOString()
        }, { onConflict: 'auth_user_id' })
        
       if (upsertError) {
         setInfoMessage('Error updating info')
         console.error(upsertError)
       } else {
         setInfoMessage('Chatbot info updated successfully!')
       }
    } else {
      setInfoMessage('Chatbot info updated successfully!')
    }
    setInfoLoading(false)
  }

  // ✅ Handle Cloudinary upload result
  const handleSignatureUpload = async (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success') return

    // result.info can be either a string or an object; guard the type before accessing secure_url
    const uploadedUrl =
      typeof result.info === 'string' ? undefined : result.info?.secure_url
    if (!uploadedUrl) return

    setSignatureUrl(uploadedUrl)

    // Save to Supabase
    const { error } = await supabase
      .from('user_profiles')
      .update({ signature: uploadedUrl, updated_at: new Date().toISOString() })
      .eq('uid', user.id)

    if (error) {
      console.error('Signature save error:', error)
      setSigMessage('❌ Error saving signature in database.')
    } else {
      setSigMessage('✅ Signature uploaded successfully!')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        <div className="flex gap-3">
            <Link
                href={`/${fetchedUsername || currentUsername}/chatbot`}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:scale-105 transition shadow-md flex items-center gap-2"
            >
                <span>Ask PortAI About Me</span>
            </Link>
            <Link
            href="/profile-form"
            className="px-4 py-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition shadow-md"
            >
            Edit Profile
            </Link>
        </div>
      </div>

      {/* Profile Info */}
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

      {/* Username Update */}
      <div className="border-t pt-6 mb-8">
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
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <p
            className={`mt-2 text-sm ${
              message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Chatbot Info Update */}
      <div className="border-t pt-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chatbot Context Info</h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide additional information (max 200 words) that the chatbot should know about you. 
          This will be used to personalize responses.
        </p>
        <form onSubmit={handleChatbotInfoUpdate}>
          <div className="mb-4">
            <textarea
              value={chatbotInfo}
              onChange={(e) => setChatbotInfo(e.target.value)}
              placeholder="e.g. I prefer Python over Java, my favorite project is PortfolioHub..."
              rows={4}
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
             <div className="text-right text-xs text-gray-500 mt-1">
               {chatbotInfo.trim() ? chatbotInfo.trim().split(/\s+/).length : 0} / 200 words
             </div>
          </div>
          <button
            type="submit"
            disabled={infoLoading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {infoLoading ? 'Saving...' : 'Save Info'}
          </button>
        </form>
        {infoMessage && (
          <p
            className={`mt-2 text-sm ${
              infoMessage.includes('Error') || infoMessage.includes('exceeds') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {infoMessage}
          </p>
        )}
      </div>

      {/* ✅ Signature Upload Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Digital Signature</h3>

        {signatureUrl ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Signature</label>
            <img
              src={signatureUrl}
              alt="Signature"
              className="border rounded-md w-60 h-auto object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No signature uploaded yet.</p>
        )}

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
          options={{
            cropping: true,
            croppingAspectRatio: 4.5, // Rectangular crop box for signatures
            sources: ['local', 'camera'],
            multiple: false,
            folder: 'signatures',
            resourceType: 'image',
          }}
          onSuccess={handleSignatureUpload}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              {signatureUrl ? 'Replace Signature' : 'Upload Signature'}
            </button>
          )}
        </CldUploadWidget>

        {sigMessage && (
          <p
            className={`mt-3 text-sm ${
              sigMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {sigMessage}
          </p>
        )}
      </div>
    </div>
  )
}
