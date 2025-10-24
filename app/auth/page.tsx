// app/(auth)/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthTabs from '@/components/AuthTabs'

export default function AuthPage() {
  // if you want to auto-redirect logged-in users, check session here
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // TODO: redirect to dashboard
        // useRouter().push('/dashboard')
      }
    })
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f2b6c] via-[#2a8f8f] to-[#4e3a7b] p-6">
      <div className="w-full max-w-3xl bg-white/6 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-1">Create your engineer portfolio</h1>
          <p className="text-sm text-white/80 mb-6">Sign up or login and get started — your portfolio at <span className="font-mono">/your-username</span></p>

          <AuthTabs />
        </div>
      </div>
    </main>
  )
}
