// app/admin/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Trash2,
  RefreshCw,
  FileText,
  FileCheck,
  FolderMinus,
  HardDrive,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Key,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react'

interface OwnerInfo {
  userId?: string
  fullName: string
  username: string
  avatarUrl?: string | null
  docType?: string
}

interface MediaResource {
  public_id: string
  format: string
  resource_type: string
  created_at: string
  bytes: number
  url: string
  folder: string
  owner?: OwnerInfo
}

interface MediaStats {
  total: number
  cvs: number
  resumes: number
  other: number
  totalBytes: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Dashboard state
  const [resources, setResources] = useState<MediaResource[]>([])
  const [stats, setStats] = useState<MediaStats>({ total: 0, cvs: 0, resumes: 0, other: 0, totalBytes: 0 })
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    action: 'clear_cvs' | 'clear_resumes' | 'clear_all' | 'delete_selected' | null
    title: string
    description: string
  }>({
    isOpen: false,
    action: null,
    title: '',
    description: '',
  })

  // Check auth status on mount
  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/admin/login')
      const data = await res.json()
      if (data.authenticated) {
        setIsAuthenticated(true)
        fetchCloudinaryMedia()
      }
    } catch {
      // not authenticated
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoggingIn(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setIsAuthenticated(true)
      fetchCloudinaryMedia()
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
    setResources([])
  }

  const fetchCloudinaryMedia = async () => {
    setIsLoadingMedia(true)
    try {
      const res = await fetch('/api/admin/cloudinary')
      const data = await res.json()
      if (data.success) {
        setResources(data.resources || [])
        setStats(data.stats || { total: 0, cvs: 0, resumes: 0, other: 0, totalBytes: 0 })
        setCurrentPage(1)
      }
    } catch (err: any) {
      showNotification('error', 'Failed to load Cloudinary media list')
    } finally {
      setIsLoadingMedia(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const executeClearAction = async (action: 'clear_cvs' | 'clear_resumes' | 'clear_all' | 'delete_selected') => {
    setActionLoading(action)
    setConfirmModal({ isOpen: false, action: null, title: '', description: '' })

    try {
      const res = await fetch('/api/admin/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          publicIds: action === 'delete_selected' ? selectedIds : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed')
      }

      showNotification('success', data.message || 'Action completed successfully')
      setSelectedIds([])
      await fetchCloudinaryMedia()
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to perform clear operation')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === resources.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(resources.map(r => r.public_id))
    }
  }

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Pagination calculation
  const totalPages = Math.ceil(resources.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, resources.length)
  const currentResources = resources.slice(startIndex, endIndex)

  // ----------------------------------------------------
  // LOGIN FORM VIEW
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#31104b] p-6 pt-28 text-white font-sans">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PortfolioHub Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with administrator credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@portfoliohub.eu.cc"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Admin Control</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            Protected Admin Portal • PortfolioHub Media Management
          </div>
        </div>
      </main>
    )
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 font-sans px-6 md:px-10 pb-6 md:pb-10 pt-32 md:pt-36">
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Admin Management Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Authorized Session
              </span>
            </div>
            <p className="text-xs text-gray-400">Manage system settings, Cloudinary media storage, & document assets</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCloudinaryMedia}
            disabled={isLoadingMedia}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMedia ? 'animate-spin' : ''}`} />
            <span>Refresh Media</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto mt-6">
          <div
            className={`p-4 rounded-xl border text-sm flex items-center justify-between shadow-lg ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Media Storage</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.total}</div>
            <div className="text-xs text-purple-300 font-semibold mt-1">
              Total Size: {formatBytes(stats.totalBytes)}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Generated CVs</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.cvs}</div>
            <div className="text-xs text-gray-400 mt-1">Folder: portfoliohub_cvs/</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Generated Resumes</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.resumes}</div>
            <div className="text-xs text-gray-400 mt-1">Folder: resumes/</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Other Media</span>
              <FolderMinus className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.other}</div>
            <div className="text-xs text-gray-400 mt-1">Uploads & profile pictures</div>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <span>Cloudinary Bulk Cleanup Controls</span>
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            Safely purge generated PDFs and media files stored in your Cloudinary environment.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  action: 'clear_cvs',
                  title: 'Clear All Generated CVs?',
                  description: 'This will delete all CV PDF files stored in the "portfoliohub_cvs/" Cloudinary folder.',
                })
              }
              disabled={actionLoading !== null}
              className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All CV PDFs ({stats.cvs})</span>
            </button>

            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  action: 'clear_resumes',
                  title: 'Clear All Generated Resumes?',
                  description: 'This will delete all Resume PDF files stored in the "resumes/" Cloudinary folder.',
                })
              }
              disabled={actionLoading !== null}
              className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-semibold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Resume PDFs ({stats.resumes})</span>
            </button>

            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  action: 'clear_all',
                  title: 'Purge All Generated Documents?',
                  description: 'This will delete ALL generated CV and Resume PDF files from Cloudinary.',
                })
              }
              disabled={actionLoading !== null}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge All Generated Documents</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    action: 'delete_selected',
                    title: `Delete ${selectedIds.length} Selected Media File(s)?`,
                    description: 'This will permanently delete the selected files from Cloudinary.',
                  })
                }
                disabled={actionLoading !== null}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Media Resources Explorer Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Cloudinary Storage Explorer</h3>
              <p className="text-xs text-gray-400">View documents, owners, avatars, and file sizes</p>
            </div>

            <div className="text-xs text-gray-400">
              Showing {startIndex + 1}-{endIndex} of {resources.length} items • {selectedIds.length} selected
            </div>
          </div>

          {isLoadingMedia ? (
            <div className="p-12 text-center text-gray-400 text-sm flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span>Loading media resources from Cloudinary...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No media resources found in your Cloudinary account.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-white/5 text-gray-400 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === resources.length && resources.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-700 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                      </th>
                      <th className="p-4">Document Owner / User</th>
                      <th className="p-4">Public ID</th>
                      <th className="p-4">Folder / Type</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentResources.map(r => (
                      <tr
                        key={`${r.resource_type}:${r.public_id}`}
                        className={`hover:bg-white/5 transition-colors ${
                          selectedIds.includes(r.public_id) ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.public_id)}
                            onChange={() => toggleSelectId(r.public_id)}
                            className="rounded border-gray-700 bg-white/10 text-purple-500 focus:ring-purple-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {r.owner?.avatarUrl ? (
                              <img
                                src={r.owner.avatarUrl}
                                alt={r.owner.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-xs">
                                {r.owner?.fullName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white text-xs">{r.owner?.fullName || 'User Document'}</div>
                              <div className="text-[11px] text-gray-400">@{r.owner?.username || 'portfoliohub'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-medium text-white max-w-[200px] truncate" title={r.public_id}>
                          {r.public_id}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300">
                              {r.folder}
                            </span>
                            {r.owner?.docType && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                {r.owner.docType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-mono">{formatBytes(r.bytes)}</td>
                        <td className="p-4 text-gray-400">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                <div>
                  Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
                  <span className="text-white font-semibold">{totalPages}</span> ({resources.length} total items)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                      .map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 hover:bg-white/10 text-gray-400'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151b2c] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">{confirmModal.description}</p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', description: '' })}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => confirmModal.action && executeClearAction(confirmModal.action)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
