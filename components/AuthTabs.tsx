//components/AuthTabs.tsx

'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function clsx(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(' ')
}

type Tab = 'signup' | 'login'

export default function AuthTabs() {
  const [tab, setTab] = useState<Tab>('signup')

  // Common states
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [forgotEmailOrUsername, setForgotEmailOrUsername] = useState('')

  // ✅ Check username availability first
  async function checkUsername() {
    if (!username.trim()) {
      setMessage('Please enter a username.')
      return
    }
    setChecking(true)
    setAvailable(null)
    setMessage(null)
    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const j = await res.json()
      if (res.ok) {
        setAvailable(j.available)
        setMessage(
          j.available
            ? 'Great — username is available!'
            : 'Sorry — username already taken.'
        )
      } else {
        setMessage(j.error || 'Error checking username.')
      }
    } catch {
      setMessage('Network error while checking username.')
    } finally {
      setChecking(false)
    }
  }

  // ✅ Signup flow — requires username check done first
  async function signupEmailPassword() {
    if (!available) {
      setMessage('Please check username availability first.')
      return
    }
    if (!email || !password) {
      setMessage('Please fill email and password.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      const uid = data.user?.id
      if (uid) {
        // ✅ Update users_usernames with uid, username, email
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, username, email }),
        })
        const j = await res.json()
        if (!res.ok) throw new Error(j.error || 'Failed to save user data.')

        setMessage('Signup success! Check your email if confirmation is required.')
      } else {
        setMessage(
          'Check your inbox to confirm your email. Account will activate after confirmation.'
        )
      }
    } catch (err: any) {
      setMessage(err?.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Login flow
  async function loginWithPassword() {
    if (!identifier || !password) {
      setMessage('Please enter email/username and password.')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Login resolution failed.')

      const resolvedEmail = j.email
      if (!resolvedEmail) throw new Error('Could not resolve email for login.')

      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })

      if (error) throw error
      setMessage('Logged in successfully!')
    } catch (err: any) {
      setMessage(err?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ OAuth
  async function oauthSignIn(provider: 'google' | 'github' | 'linkedin_oidc') {
    setLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
        },
      })
    } catch (err: any) {
      setMessage(err?.message || 'OAuth failed to start.')
      setLoading(false)
    }
  }

  // ✅ Forgot password
  async function forgotPasswordSend() {
    if (!forgotEmailOrUsername) {
      setMessage('Please provide email or username')
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotEmailOrUsername }),
      })
      const j = await res.json()
      if (res.ok)
        setMessage(j.message || 'If an account exists, a reset email has been sent.')
      else setMessage(j.error || 'Error requesting password reset.')
    } catch {
      setMessage('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/5 p-4 rounded-lg">
      <div className="flex gap-2 mb-6">
        <button
          className={clsx(
            'px-4 py-2 rounded-md font-semibold transition-colors',
            tab === 'signup'
              ? 'bg-gradient-to-r from-green-400 to-purple-500 text-white shadow-lg'
              : 'bg-white/6 text-white/80'
          )}
          onClick={() => setTab('signup')}
        >
          Sign up
        </button>
        <button
          className={clsx(
            'px-4 py-2 rounded-md font-semibold transition-colors',
            tab === 'login'
              ? 'bg-gradient-to-r from-green-400 to-purple-500 text-white shadow-lg'
              : 'bg-white/6 text-white/80'
          )}
          onClick={() => setTab('login')}
        >
          Login
        </button>
      </div>

      {/* ✅ SIGNUP TAB */}
      {tab === 'signup' ? (
        <div className="space-y-4">
          {/* Step 1: Username check */}
          <div>
            <label className="block text-sm text-white/90">Choose Username</label>
            <div className="flex gap-2 mt-2">
              <input
                value={username}
                onChange={e => {
                  setUsername(e.target.value)
                  setAvailable(null)
                }}
                className="flex-1 rounded-md p-3 bg-white/5 text-white outline-none"
                placeholder="unique-username"
              />
              <button
                onClick={checkUsername}
                className="px-4 py-2 rounded-md bg-white/8 hover:bg-white/10 text-white"
              >
                {checking ? 'Checking...' : 'Check'}
              </button>
            </div>
            {available === true && (
              <p className="text-xs mt-1 text-green-300">Available ✓</p>
            )}
            {available === false && (
              <p className="text-xs mt-1 text-rose-300">Taken ✕</p>
            )}
          </div>

          {/* Step 2: Show email/password only after username is available */}
          {available && (
            <>
              <div>
                <label className="block text-sm text-white/90">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-md p-3 bg-white/5 text-white outline-none mt-2"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm text-white/90">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-md p-3 bg-white/5 text-white outline-none mt-2"
                  placeholder="strong password"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={signupEmailPassword}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-600 hover:scale-[1.01] transition-transform text-white shadow-lg"
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </button>

                <div className="text-sm text-white/70">or</div>

                <div className="flex gap-2">
                  <button
                    onClick={() => oauthSignIn('google')}
                    className="px-3 py-2 rounded-md bg-white/6 text-white"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => oauthSignIn('github')}
                    className="px-3 py-2 rounded-md bg-white/6 text-white"
                  >
                    GitHub
                  </button>
                  <button
                    onClick={() => oauthSignIn('linkedin_oidc')}
                    className="px-3 py-2 rounded-md bg-white/6 text-white"
                  >
                    LinkedIn
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // ✅ LOGIN TAB
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/90">Email or Username</label>
            <input
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full rounded-md p-3 bg-white/5 text-white outline-none mt-2"
              placeholder="you@company.com or username"
            />
          </div>

          <div>
            <label className="block text-sm text-white/90">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md p-3 bg-white/5 text-white outline-none mt-2"
              placeholder="password"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loginWithPassword}
              disabled={loading}
              className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-600 hover:scale-[1.01] transition-transform text-white shadow-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-sm text-white/70">or</div>

           <div className="flex gap-2">
  <button
    onClick={() => oauthSignIn('google')}
    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 text-white"
  >
    <img
      src="https://www.google.com/s2/favicons?domain=www.google.com&sz=32"
      alt="Google"
      className="w-4 h-4"
    />
    Google
  </button>

  <button
    onClick={() => oauthSignIn('github')}
    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 text-white"
  >
    <img
      src="https://www.google.com/s2/favicons?domain=www.github.com&sz=32"
      alt="GitHub"
      className="w-4 h-4"
    />
    GitHub
  </button>

  <button
    onClick={() => oauthSignIn('linkedin_oidc')}
    className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 text-white"
  >
    <img
      src="https://www.google.com/s2/favicons?domain=www.linkedin.com&sz=32"
      alt="LinkedIn"
      className="w-4 h-4"
    />
    LinkedIn
  </button>
</div>

          </div>

          <details className="mt-2">
            <summary className="text-sm text-white/80 cursor-pointer">
              Forgot password?
            </summary>
            <div className="mt-2">
              <div className="flex gap-2">
                <input
                  value={forgotEmailOrUsername}
                  onChange={e => setForgotEmailOrUsername(e.target.value)}
                  placeholder="email or username"
                  className="flex-1 rounded-md p-2 bg-white/5 text-white outline-none"
                />
                <button
                  onClick={forgotPasswordSend}
                  disabled={loading}
                  className="px-3 py-2 rounded-md bg-white/8 text-white"
                >
                  {loading ? 'Sending...' : 'Send reset'}
                </button>
              </div>
            </div>
          </details>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 rounded-md bg-white/6 text-white/90">{message}</div>
      )}
    </div>
  )
}
