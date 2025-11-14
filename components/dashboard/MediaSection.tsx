// components/dashboard/MediaSection.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface MediaItem {
  id: string
  type: 'image' | 'video' | 'link' | 'text'   // <-- added 'text'
  url: string
  title?: string
  description?: string
}

interface Section {
  id: string
  name: string
  items: MediaItem[]
}

interface MediaSectionProps {
  user: any
}

export default function MediaSection({ user }: MediaSectionProps) {
  const [mediaData, setMediaData] = useState<{ media?: Section[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user) fetchMedia()
  }, [user])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('skills')
        .select('media')
        .eq('auth_user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          setMediaData({ media: [] })
          return
        } else {
          console.error('Error fetching media sections:', error)
          setMessage('Failed to fetch media.')
          setMediaData({ media: [] })
          return
        }
      }

      if (data) {
        const media = Array.isArray(data.media)
          ? data.media
          : typeof data.media === 'string'
          ? JSON.parse(data.media)
          : []

        setMediaData({ media })
      } else {
        setMediaData({ media: [] })
      }
    } catch (err) {
      console.error('Fetch media error', err)
      setMessage('Failed to fetch media.')
      setMediaData({ media: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push('/media-form')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const sections: Section[] = mediaData?.media ?? []

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Portfolio Sections</h2>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {sections.length === 0 ? 'Add Sections' : 'Edit'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No portfolio sections yet, Add your Achievements, Services, works and more to get started!</p>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{section.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{section.items.length} card{section.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-gray-50 border overflow-hidden">
                    <div className="flex items-start gap-4">
                      {/* Image preview */}
                      {item.type === 'image' ? (
                        <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-white/60 border">
                          <img
                            src={item.url}
                            alt={item.title ?? 'image'}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/image-placeholder.png' }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 rounded-md bg-gray-100 border flex items-center justify-center text-sm text-gray-600">
                          {item.type === 'video' ? 'VIDEO' : item.type === 'text' ? 'TEXT' : 'LINK'}
                        </div>
                      )}

                      {/* Main content: title + description + url or text preview (truncates) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 truncate">{item.title || '(untitled)'}</div>

                            {item.type === 'text' ? (
                              // Fancy text preview: preserve line breaks, limited height
                              <div className="mt-2 text-sm text-gray-700 bg-white rounded p-3 border text-left whitespace-pre-wrap max-h-32 overflow-auto">
                                {item.url}
                              </div>
                            ) : (
                              <>
                                {item.description && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</div>}
                                <div className="mt-2 text-xs text-gray-500 truncate">{item.url}</div>
                              </>
                            )}
                          </div>

                          {/* Right actions column: fixed width, doesn't grow */}
                          <div className="ml-auto flex-shrink-0 w-28 flex flex-col items-end gap-2">
                            <span className="px-2 py-1 text-xs font-medium uppercase bg-gray-100 text-gray-700 rounded">
                              {String(item.type).toUpperCase()}
                            </span>

                            {/* Show Open only for non-text types and when url looks like a link */}
                            {item.type !== 'text' && item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-1 text-blue-600 hover:underline text-sm max-w-full text-right truncate"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
