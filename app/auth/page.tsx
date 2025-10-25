// app/(auth)/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import AuthTabs from '@/components/AuthTabs'

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f2b6c] via-[#2a8f8f] to-[#4e3a7b] p-6">
        <div className="w-full max-w-4xl bg-white/6 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-8 text-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f2b6c] via-[#2a8f8f] to-[#4e3a7b] p-6">
      {/* Increased max-width from max-w-3xl to max-w-4xl for wider container */}
      <div className="w-full max-w-4xl bg-white/6 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-1">Create your engineer portfolio</h1>
          <p className="text-sm text-white/80 mb-6">Sign up or login and get started — your portfolio at <span className="font-mono">/your-username</span></p>

          <AuthTabs />
        </div>
      </div>
    </main>
  )
}