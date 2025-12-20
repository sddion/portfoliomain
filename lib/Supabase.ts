import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Some features may not work.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)


let authPromise: Promise<any> | null = null

/**
 * Helper to ensure user is logged in anonymously
 * Deduplicates concurrent requests to prevent multiple sign-ins
 */
export async function ensureAnonymousAuth() {
  if (authPromise) return authPromise

  authPromise = (async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return null
      }
  
      if (session) return session.user
  
      const { data: authData, error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('Anonymous login failed:', error)
        return null
      }
      
      // Attempt to sync profile with previous session based on IP
      try {
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (newSession?.access_token) {
          // Fetch public IP
          let publicIp = null
          try {
            const ipRes = await fetch('https://ipapi.co/json/')
            const ipData = await ipRes.json()
            publicIp = ipData.ip
          } catch (e) {
            console.warn('Failed to fetch public IP:', e)
          }

          await fetch('/api/sync-profile', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${newSession.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: publicIp })
          })
        }
      } catch (err) {
        console.warn('Failed to sync profile:', err)
      }
  
      return authData.user
    } finally {
      // Clear promise after a short delay to allow fresh checks later if needed,
      // but keep it long enough to cover React Strict Mode double-invocations
      setTimeout(() => { authPromise = null }, 1000)
    }
  })()

  return authPromise
}
