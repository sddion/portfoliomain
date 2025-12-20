import { useState, useEffect, useCallback } from 'react'
import { supabase, ensureAnonymousAuth } from '@/lib/Supabase'
import { User } from '@supabase/supabase-js'

export interface UserSettings {
  wallpaper?: string
  theme?: string
  dockPosition?: 'bottom' | 'top' | 'left' | 'right'
  isRecruiter?: boolean
  lastSeen?: string
  font?: string
  iconSet?: 'lucide' | 'material'
  [key: string]: any
}

export function useUserStore() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings>({ 
    iconSet: 'lucide', 
    font: 'geist' 
  })
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Profile not found (yet), using default settings.', error.code)
      } else if (data) {
        setSettings(prev => ({ ...prev, ...(data.settings || {}) }))
      }
    } catch (e) {
      console.error('Fetch profile failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings: updated, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
    } catch (e) {
      console.error('Update settings failed:', e)
    }
  }

  useEffect(() => {
    async function init() {
      const authUser = await ensureAnonymousAuth()
      if (authUser) {
        setUser(authUser)
        await fetchProfile(authUser.id)
      } else {
        setLoading(false)
      }
    }

    init()
  }, [fetchProfile])

  return {
    user,
    settings,
    loading,
    updateSettings
  }
}
