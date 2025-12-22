import { useState, useEffect, useCallback } from 'react'
import { IDESettings } from '@/components/apps/ide/types'

export interface UserSettings {
  wallpaper?: string
  theme?: string
  dockPosition?: 'bottom' | 'top' | 'left' | 'right'
  isRecruiter?: boolean
  lastSeen?: string
  ide?: IDESettings
  [key: string]: any
}

const DEFAULT_SETTINGS: UserSettings = {
  ide: {
    board: "ESP32 Dev Module",
    baudRate: 115200,
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    verbose: false,
    theme: "vs-dark",
    tabSize: 4,
    wordWrap: "off",
    minimap: true,
    lineNumbers: "on"
  }
}

export function useUserStore() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Load settings from localStorage on init
  useEffect(() => {
    const stored = localStorage.getItem('sddionOS_user_settings')
    if (stored) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }))
      } catch (e) {
        console.error('Failed to parse stored settings:', e)
      }
    }
    setLoading(false)
  }, [])

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('sddionOS_user_settings', JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    user: null, // Global user is now null, flasher has its own
    settings,
    loading,
    updateSettings
  }
}
