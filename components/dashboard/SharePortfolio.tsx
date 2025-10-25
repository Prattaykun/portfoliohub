"use client"
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SharePortfolio({ user }: { user: any }) {
  const [username, setUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  const handleIframeLoad = () => {
    setIframeLoading(false)
    setIframeError(false)
  }

  const handleIframeError = () => {
    setIframeLoading(false)
    setIframeError(true)
  }

  const refreshPreview = () => {
    if (iframeRef.current && portfolioUrl) {
      setIframeLoading(true)
      setIframeError(false)
      // Force reload the iframe
      iframeRef.current.src = portfolioUrl
    }
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
      
      {/* Shareable Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Your Portfolio Link</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3">
            <p className="text-gray-800 font-mono break-all">{portfolioUrl}</p>
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!portfolioUrl}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <p className="text-sm text-blue-700">
          Share this link with employers, clients, or anyone you want to showcase your portfolio to.
        </p>
      </div>

      {/* Live Preview Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshPreview}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className='text-black'>Refresh</span>
            </button>
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Preview Container */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Browser Chrome */}
          <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1">
              <p className="text-xs text-gray-600 truncate">{portfolioUrl}</p>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="relative bg-gray-50" style={{ height: '500px' }}>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              </div>
            )}

            {iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 mb-2">Failed to load preview</p>
                  <button
                    onClick={refreshPreview}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={portfolioUrl}
              className="w-full h-full"
              title="Portfolio Preview"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              This is how your portfolio appears to visitors. The preview updates automatically when you make changes.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-600">Portfolio Status</p>
              <p className="text-lg font-semibold text-green-800">Live</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-600">Your Username</p>
              <p className="text-lg font-semibold text-blue-800">{username}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-purple-600">Ready to Share</p>
              <p className="text-lg font-semibold text-purple-800">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}