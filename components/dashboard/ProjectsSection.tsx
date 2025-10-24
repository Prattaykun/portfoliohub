"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

interface ProjectsSectionProps {
  user: any
}

export default function ProjectsSection({ user }: ProjectsSectionProps) {
  const [projectsData, setProjectsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchProjectsData()
    }
  }, [user])

  const fetchProjectsData = async () => {
    try {
      const { data, error } = await supabase
        .from('project')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/project-form')
        return
      }

      setProjectsData(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      router.push('/project-form')
    } finally {
      setLoading(false)
    }
  }

  // const handleEdit = (project: any) => {
  //   setEditingProject(project.id)
  //   setFormData(project)
  // }

  // const handleCancelEdit = () => {
  //   setEditingProject(null)
  //   setFormData({})
  //   setMessage('')
  // }

  const handleUpdate = async (projectId: string) => {
    if (!formData.title || !formData.overview) {
      setMessage('Title and overview are required')
      return
    }

    try {
      const updatedProjects = projectsData.projects.map((project: any) =>
        project.id === projectId ? { ...project, ...formData } : project
      )

      const { error } = await supabase
        .from('project')
        .update({
          projects: updatedProjects,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        setMessage('Error updating project')
      } else {
        setProjectsData({ ...projectsData, projects: updatedProjects })
        setEditingProject(null)
        setFormData({})
        setMessage('Project updated successfully!')
      }
    } catch (error) {
      setMessage('Error updating project')
    }
  }

  // const handleDelete = async (projectId: string) => {
  //   if (!confirm('Are you sure you want to delete this project?')) return

  //   try {
  //     const updatedProjects = projectsData.projects.filter(
  //       (project: any) => project.id !== projectId
  //     )

  //     const { error } = await supabase
  //       .from('project')
  //       .update({
  //         projects: updatedProjects,
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', user.id)

  //     if (error) {
  //       setMessage('Error deleting project')
  //     } else {
  //       setProjectsData({ ...projectsData, projects: updatedProjects })
  //       setMessage('Project deleted successfully!')
  //     }
  //   } catch (error) {
  //     setMessage('Error deleting project')
  //   }
  // }

  const handleAddProject = () => {
    router.push('/project-form')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Parse projects data if it's stored as JSON string
  const projects = typeof projectsData.projects === 'string' 
    ? JSON.parse(projectsData.projects) 
    : projectsData.projects

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Skills</h2>
        <button
          onClick={() => router.push('/project-form')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {projects.map((project: any) => (
          <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            {editingProject === project.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overview *
                  </label>
                  <textarea
                    value={formData.overview || ''}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process
                  </label>
                  <textarea
                    value={formData.process || ''}
                    onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Results
                  </label>
                  <textarea
                    value={formData.results || ''}
                    onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Link
                  </label>
                  <input
                    type="url"
                    value={formData.repoLink || ''}
                    onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
{/* 
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdate(project.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div> */}
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 mt-1">{project.role}</p>
                  </div>
                  {/* <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Overview</h4>
                      <p className="text-gray-600">{project.overview}</p>
                    </div>

                    {project.process && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Process</h4>
                        <p className="text-gray-600">{project.process}</p>
                      </div>
                    )}

                    {project.results && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Results</h4>
                        <p className="text-gray-600">{project.results}</p>
                      </div>
                    )}

                    {project.repoLink && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Repository</h4>
                        <a
                          href={project.repoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View Code
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack?.map((tech: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center space-x-1"
                        >
                          {tech.logo_url && (
                            <img src={tech.logo_url} alt={tech.name} className="w-4 h-4" />
                          )}
                          <span>{tech.name}</span>
                        </span>
                      ))}
                    </div>

                    {project.media && project.media.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">Media</h4>
                        <div className="space-y-2">
                          {project.media.map((media: any) => (
                            <a
                              key={media.id}
                              href={media.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <span className="capitalize">{media.type}</span>
                              <span>→</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No projects added yet</p>
          <button
            onClick={handleAddProject}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  )
}