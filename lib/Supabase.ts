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
      
      try {
        const { data: { session: newSession } } = await supabase.auth.getSession()
        if (newSession?.access_token) {
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
      setTimeout(() => { authPromise = null }, 1000)
    }
  })()

  return authPromise
}

/**
 * Sign in with GitHub OAuth via Supabase
 * Returns GitHub access token that can be used for Git operations
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'repo read:user user:email',
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  })
  
  if (error) {
    console.error('GitHub OAuth error:', error)
    throw error
  }
  
  return data
}

/**
 * Get current GitHub provider token if user is logged in via GitHub
 */
export async function getGitHubToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  
  // Check if user logged in via GitHub
  if (session.user?.app_metadata?.provider === 'github') {
    return session.provider_token || null
  }
  
  return null
}

/**
 * Get current user info including GitHub details
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

/**
 * Check if user is authenticated with GitHub
 */
export async function isGitHubAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.app_metadata?.provider === 'github'
}

