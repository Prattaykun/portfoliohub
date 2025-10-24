"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

interface ContactSectionProps {
  user: any
}

interface SocialPlatform {
  id: string
  name: string
  logo_url: string
  brand_color: string
  base_url: string
}

interface OtherLink {
  id: string
  name: string
  url: string
  logo_url?: string
}

export default function ContactSection({ user }: ContactSectionProps) {
  const [contactData, setContactData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [message, setMessage] = useState('')
  const [newLink, setNewLink] = useState({ name: '', url: '', logo_url: '' })
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([])
  const [platformSuggestions, setPlatformSuggestions] = useState<SocialPlatform[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchContactData()
    fetchSocialPlatforms()
  }, [user])

  const fetchContactData = async () => {
    try {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/contact-form')
        return
      }

      setContactData(data)
      setFormData({
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        other_links: data.other_links || []
      })
    } catch (error) {
      console.error('Error fetching contact data:', error)
      router.push('/contact-form')
    } finally {
      setLoading(false)
    }
  }

  const fetchSocialPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('social')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching social platforms:', error)
      } else {
        setSocialPlatforms(data || [])
      }
    } catch (error) {
      console.error('Error fetching social platforms:', error)
    }
  }

  const handleSave = async () => {
    if (!formData.email) {
      setMessage('Email is required')
      return
    }

    try {
      const { error } = await supabase
        .from('contact')
        .upsert({
          auth_user_id: user.id,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          linkedin: formData.linkedin,
          github: formData.github,
          other_links: formData.other_links,
          updated_at: new Date().toISOString()
        })

      if (error) {
        setMessage('Error updating contact information')
      } else {
        setContactData({ ...contactData, ...formData })
        setEditing(false)
        setMessage('Contact information updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error updating contact information')
    }
  }

  const handleCancel = () => {
    setFormData({
      email: contactData?.email || '',
      phone: contactData?.phone || '',
      address: contactData?.address || '',
      linkedin: contactData?.linkedin || '',
      github: contactData?.github || '',
      other_links: contactData?.other_links || []
    })
    setEditing(false)
    setMessage('')
    setNewLink({ name: '', url: '', logo_url: '' })
    setShowSuggestions(false)
  }

  const handlePlatformSearch = (searchTerm: string) => {
    setNewLink({ ...newLink, name: searchTerm })
    
    if (searchTerm.length > 1) {
      const filtered = socialPlatforms.filter(platform =>
        platform.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setPlatformSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectPlatform = (platform: SocialPlatform) => {
    setNewLink({
      name: platform.name,
      url: platform.base_url,
      logo_url: platform.logo_url
    })
    setShowSuggestions(false)
  }

  const addOtherLink = () => {
    if (!newLink.name || !newLink.url) {
      setMessage('Please provide both name and URL')
      return
    }

    const newLinkWithId: OtherLink = {
      id: `link-${Date.now()}`,
      name: newLink.name,
      url: newLink.url,
      logo_url: newLink.logo_url
    }

    setFormData({
      ...formData,
      other_links: [...(formData.other_links || []), newLinkWithId]
    })
    setNewLink({ name: '', url: '', logo_url: '' })
    setMessage('')
  }

  const removeOtherLink = (index: number) => {
    const updatedLinks = formData.other_links.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, other_links: updatedLinks })
  }

  const getSocialIcon = (platformName: string) => {
    const platform = socialPlatforms.find(p => p.name === platformName)
    return platform?.logo_url || null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Contact Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Basic Information
          </h3>

          {editing ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{contactData?.email}</p>
              </div>

              {contactData?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{contactData.phone}</p>
                </div>
              )}

              {contactData?.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900 whitespace-pre-line">{contactData.address}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Professional Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Professional Links
          </h3>

          {editing ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Other Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Other Social Links
                </label>
                
                <div className="space-y-3 mb-4">
                  {formData.other_links?.map((link: OtherLink, index: number) => (
                    <div key={link.id} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      {link.logo_url && (
                        <img 
                          src={link.logo_url} 
                          alt={link.name}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => {
                            const updatedLinks = [...formData.other_links]
                            updatedLinks[index].name = e.target.value
                            setFormData({ ...formData, other_links: updatedLinks })
                          }}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Platform name"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => {
                            const updatedLinks = [...formData.other_links]
                            updatedLinks[index].url = e.target.value
                            setFormData({ ...formData, other_links: updatedLinks })
                          }}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                      <button
                        onClick={() => removeOtherLink(index)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Link */}
                <div className="border-t pt-4">
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search platform (e.g., Facebook, Instagram)"
                        value={newLink.name}
                        onChange={(e) => handlePlatformSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      {showSuggestions && platformSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {platformSuggestions.map((platform) => (
                            <div
                              key={platform.id}
                              className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => selectPlatform(platform)}
                            >
                              <img 
                                src={platform.logo_url} 
                                alt={platform.name}
                                className="w-5 h-5 object-contain"
                              />
                              <span className="text-sm font-medium">{platform.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="URL (e.g., https://www.example.com/username)"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                    {newLink.logo_url && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Selected platform:</span>
                        <img 
                          src={newLink.logo_url} 
                          alt={newLink.name}
                          className="w-5 h-5 object-contain"
                        />
                        <span>{newLink.name}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={addOtherLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                    type="button"
                  >
                    Add Social Link
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              {contactData?.linkedin && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={getSocialIcon('LinkedIn') || '/default-icon.svg'} 
                    alt="LinkedIn"
                    className="w-6 h-6 object-contain"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <a
                      href={contactData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline break-words"
                    >
                      {contactData.linkedin}
                    </a>
                  </div>
                </div>
              )}

              {contactData?.github && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={getSocialIcon('GitHub') || '/default-icon.svg'} 
                    alt="GitHub"
                    className="w-6 h-6 object-contain"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <a
                      href={contactData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline break-words"
                    >
                      {contactData.github}
                    </a>
                  </div>
                </div>
              )}

              {contactData?.other_links && contactData.other_links.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Social Links
                  </label>
                  <div className="space-y-3">
                    {contactData.other_links.map((link: OtherLink) => (
                      <div key={link.id} className="flex items-center space-x-3">
                        <img 
                          src={link.logo_url || getSocialIcon(link.name) || '/default-icon.svg'} 
                          alt={link.name}
                          className="w-6 h-6 object-contain"
                        />
                        <div className="flex-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline break-words flex items-center space-x-1"
                          >
                            <span>{link.name}</span>
                            <span>→</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}