"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { useUserStore } from "@/hooks/use-user-store"
import { INITIAL_APPS, AppWithComponent } from "@/data/apps"

export interface WindowState {
    id: string
    title: string
    content: React.ReactNode
    isOpen: boolean
    isMinimized: boolean
    isMaximized: boolean
    zIndex: number
    icon?: React.ReactNode
    width?: string
    height?: string
}

interface WindowOptions {
    width?: string
    height?: string
}

interface WindowContextType {
    windows: WindowState[]
    openWindow: (id: string, title: string, content: React.ReactNode, icon?: React.ReactNode, options?: WindowOptions) => void
    closeWindow: (id: string) => void
    minimizeWindow: (id: string) => void
    maximizeWindow: (id: string) => void
    focusWindow: (id: string) => void
    activeWindowId: string | null
    isBooting: boolean
    setBooting: (booting: boolean) => void
    isLoggedIn: boolean
    login: () => void
    logout: () => void
    showSnowfall: boolean
    toggleSnowfall: () => void
    user: any
    settings: any
    updateSettings: (newSettings: any) => Promise<void>

    // App Management
    installedApps: AppWithComponent[]
    allApps: AppWithComponent[]
    installApp: (appId: string) => void
    uninstallApp: (appId: string) => void
    isAppInstalled: (appId: string) => boolean
    isAppsLoaded: boolean

    // Window state helpers
    hasMaximizedWindow: boolean
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

export function WindowProvider({ children }: { children: ReactNode }) {
    const { user, settings, updateSettings, loading: authLoading } = useUserStore()
    const { theme, setTheme } = useTheme()
    const [windows, setWindows] = useState<WindowState[]>([])
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
    const [isBooting, setBooting] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showSnowfall, setShowSnowfall] = useState(true)

    // App State
    const [installedIds, setInstalledIds] = useState<string[]>([])
    const [isAppsLoaded, setIsAppsLoaded] = useState(false)

    // Sync theme from settings or set default based on device
    useEffect(() => {
        if (authLoading) return

        const activeTheme = settings?.theme
        if (activeTheme) {
            // Only update if it's actually different from current mounted theme
            if (activeTheme !== theme) {
                setTheme(activeTheme)
            }
        } else if (!theme) {
            // No theme set yet and no theme in settings, apply environment default
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
            const defaultTheme = isMobile ? 'ubuntu' : 'ocean'
            setTheme(defaultTheme)
        }
        // Removed 'theme' from dependencies to prevent feedback loops when setting theme locally
    }, [settings?.theme, setTheme, authLoading])

    useEffect(() => {
        if (typeof window !== 'undefined' && !authLoading && user) {
            // Check if user was previously "logged in" to the OS UI
            const storedLogin = localStorage.getItem("sddionOS_login")
            if (storedLogin) {
                setIsLoggedIn(true)
            }
        }
    }, [authLoading, user])

    // Load installed apps
    useEffect(() => {
        if (typeof window === 'undefined') return

        const storedApps = localStorage.getItem("sddionOS_installed_apps")
        if (storedApps) {
            try {
                setInstalledIds(JSON.parse(storedApps))
            } catch (e) {
                setInstalledIds(INITIAL_APPS.filter(a => a.isDefault).map(a => a.id))
            }
        } else {
            setInstalledIds(INITIAL_APPS.filter(a => a.isDefault).map(a => a.id))
        }
        setIsAppsLoaded(true)
    }, [])

    const login = useCallback(() => {
        setIsLoggedIn(true)
        setBooting(true)
        localStorage.setItem("sddionOS_login", Date.now().toString())
    }, [])

    const logout = useCallback(() => {
        setIsLoggedIn(false)
        setWindows([])
        setBooting(false)
        localStorage.removeItem("sddionOS_login")
    }, [])

    const focusWindow = useCallback((id: string) => {
        setWindows((prevWindows) => {
            const currentMaxZ = Math.max(...prevWindows.map(w => w.zIndex), 10);
            const newZ = currentMaxZ + 1;

            const updatedWindows = prevWindows.map((w) =>
                w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w
            );

            setActiveWindowId(id);

            return updatedWindows;
        });
    }, []);

    const openWindow = useCallback((id: string, title: string, content: React.ReactNode, icon?: React.ReactNode, options?: WindowOptions) => {
        setWindows((prev) => {
            const existing = prev.find((w) => w.id === id);
            if (existing) {
                setActiveWindowId(id);

                return prev.map((w) =>
                    w.id === id
                        ? {
                            ...w,
                            content: content,
                            width: options?.width || w.width,
                            height: options?.height || w.height,
                            isMinimized: false,
                            zIndex: Math.max(...prev.map(win => win.zIndex)) + 1
                        }
                        : w
                );
            }

            const currentMaxZ = Math.max(...prev.map(w => w.zIndex), 10);
            const newZ = currentMaxZ + 1;

            const newCtx: WindowState = {
                id,
                title,
                content,
                isOpen: true,
                isMinimized: false,
                isMaximized: false,
                zIndex: newZ,
                icon,
                width: options?.width,
                height: options?.height,
            };

            setActiveWindowId(id);
            return [...prev, newCtx];
        });
    }, []);

    const closeWindow = useCallback((id: string) => {
        setWindows((prev) => {
            const updated = prev.filter((w) => w.id !== id)

            // If we closed the active window, find the next one to focus
            if (activeWindowId === id) {
                if (updated.length > 0) {
                    // Find window with highest zIndex
                    const next = updated.reduce((prev, current) =>
                        (prev.zIndex > current.zIndex) ? prev : current
                    )
                    setActiveWindowId(next.id)
                } else {
                    setActiveWindowId(null)
                }
            }

            return updated
        })
    }, [activeWindowId])

    const minimizeWindow = useCallback((id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
        )
    }, [])

    const maximizeWindow = useCallback((id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
        )
        focusWindow(id)
    }, [focusWindow])

    const toggleSnowfall = useCallback(() => setShowSnowfall(prev => !prev), [])

    // App Management Implementation
    const installApp = useCallback((appId: string) => {
        setInstalledIds(prev => {
            if (prev.includes(appId)) return prev
            const newIds = [...prev, appId]
            localStorage.setItem("sddionOS_installed_apps", JSON.stringify(newIds))
            return newIds
        })
    }, [])

    const uninstallApp = useCallback((appId: string) => {
        // Check if app is protected
        const appConfig = INITIAL_APPS.find(a => a.id === appId)
        if (appConfig?.preventUninstall) {
            return // Implicitly blocked
        }

        setInstalledIds(prev => {
            const newIds = prev.filter(id => id !== appId)
            localStorage.setItem("sddionOS_installed_apps", JSON.stringify(newIds))
            return newIds
        })
        // Also close the window if it's open
        closeWindow(appId)
    }, [closeWindow])

    const isAppInstalled = useCallback((appId: string) => {
        return installedIds.includes(appId)
    }, [installedIds])

    const isRecruiter = settings?.isRecruiter === true

    const filteredApps = React.useMemo(() => {
        return INITIAL_APPS.filter(app => {
            if (!app.roles) return true
            if (isRecruiter) {
                return true // Recruiter sees everything (including recruiter-only apps)
            } else {
                // Guest: Hide apps marked for recruiter
                if (app.roles.includes('recruiter')) return false
                return true
            }
        })
    }, [isRecruiter])

    const installedApps = filteredApps.filter(app => installedIds.includes(app.id))

    // Check if any window is maximized (for taskbar auto-hide)
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized)

    const value = React.useMemo(() => ({
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        activeWindowId,
        isBooting,
        setBooting,
        isLoggedIn,
        login,
        logout,
        showSnowfall,
        toggleSnowfall,
        user,
        settings,
        updateSettings,
        installedApps,
        allApps: filteredApps,
        installApp,
        uninstallApp,
        isAppInstalled,
        isAppsLoaded,
        hasMaximizedWindow
    }), [
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        activeWindowId,
        isBooting,
        isLoggedIn,
        login,
        logout,
        showSnowfall,
        toggleSnowfall,
        user,
        settings,
        updateSettings,
        installedApps,
        filteredApps,
        installApp,
        uninstallApp,
        isAppInstalled,
        isAppsLoaded,
        hasMaximizedWindow
    ])

    return (
        <WindowContext.Provider value={value}>
            {children}
        </WindowContext.Provider>
    )
}

export const useWindowManager = () => {
    const context = useContext(WindowContext)
    if (!context) throw new Error("useWindowManager must be used within a WindowProvider")
    return context
}
