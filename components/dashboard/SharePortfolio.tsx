"use client"
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SharePortfolio({ user }: { user: any }) {
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchUsername()
  }, [user])

  const fetchUsername = async () => {
    const { data } = await supabase
      .from('users_usernames')
      .select('username')
      .eq('auth_user_id', user.id)
      .single()

    if (data) {
      setUsername(data.username)
    }
  }

  // ✅ Strictly use environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const portfolioUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${username}` : ''

  const copyToClipboard = async () => {
    if (!portfolioUrl) return
    await navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!username) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Share Portfolio</h2>
        <p className="text-gray-600">
          Please set a username in the Profile section to get your shareable link.
        </p>
      </div>
    )
  }

  if (!baseUrl) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Share Portfolio</h2>
        <p className="text-red-600">
          Error: <code>NEXT_PUBLIC_SITE_URL</code> environment variable is not set.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Share Your Portfolio</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Your Portfolio Link</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3">
            <p className="text-gray-800 font-mono break-all">{portfolioUrl}</p>
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!portfolioUrl}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <p className="text-sm text-blue-700">
          Share this link with employers, clients, or anyone you want to showcase your portfolio to.
        </p>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-gray-600 mb-2">Your portfolio will look like this:</p>
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {portfolioUrl}
          </a>
        </div>
      </div>
    </div>
  )
}
