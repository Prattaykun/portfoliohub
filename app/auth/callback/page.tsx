'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function OAuthCallback() {
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    async function finalize() {
      const { data, error } = await supabase.auth.getSession()
      if (error) { 
        setStatus('Error fetching session') 
        return 
      }

      const session = data.session
      const user = session?.user
      if (!user) {
        setStatus('No user session found.')
        return
      }

      // ✅ Try to extract username from GitHub metadata or email
      const metadata = user.user_metadata || {}
      let username = metadata.user_name || metadata.preferred_username || metadata.name || null

      // ✅ Fallback: derive username from email if none found
      if (!username && user.email) {
        username = user.email.split('@')[0]
      }

      // ✅ If still null, generate a random fallback
      if (!username) {
        username = `user_${user.id.substring(0, 6)}`
      }

      setStatus('Registering your account...')
      try {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.id,
            email: user.email,
            username,
          }),
        })

        if (!res.ok) throw new Error('Signup API failed')

        setStatus('Success! Redirecting to your dashboard...')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 900)
      } catch (err) {
        console.error(err)
        setStatus('Failed to finalize signup.')
      }
    }

    finalize()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#14203b] via-[#1f7b7b] to-[#40244d] text-white p-8">
      <div className="bg-white/6 p-8 rounded-xl shadow-lg">
        <p>{status}</p>
      </div>
    </div>
  )
}
