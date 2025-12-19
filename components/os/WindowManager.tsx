"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"

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
}

const WindowContext = createContext<WindowContextType | undefined>(undefined)

const LoginExpiry = 24 * 60 * 60 * 1000 // 24 hours in ms

export function WindowProvider({ children }: { children: ReactNode }) {
    const [windows, setWindows] = useState<WindowState[]>([])
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
    const [isBooting, setBooting] = useState(false) // Boot handled by login now
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [maxZIndex, setMaxZIndex] = useState(10)

    useEffect(() => {
        const storedLogin = localStorage.getItem("sanjuos_login")
        if (storedLogin) {
            const loginTime = parseInt(storedLogin)
            if (Date.now() - loginTime < LoginExpiry) {
                setIsLoggedIn(true)
                // If previously logged in, we skip the boot sequence for seamless refresh
                // unless the user specifically wants it. For now, just set logged in.
            } else {
                localStorage.removeItem("sanjuos_login")
            }
        }
    }, [])

    const login = () => {
        setIsLoggedIn(true)
        setBooting(true) // Trigger boot on login
        localStorage.setItem("sanjuos_login", Date.now().toString())
    }

    const logout = () => {
        setIsLoggedIn(false)
        setWindows([]) // Clear windows on logout
        setBooting(false)
        localStorage.removeItem("sanjuos_login")
    }

    const focusWindow = (id: string) => {
        setActiveWindowId(id)
        const newZ = maxZIndex + 1
        setMaxZIndex(newZ)
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w))
        )
    }

    const openWindow = (id: string, title: string, content: React.ReactNode, icon?: React.ReactNode, options?: WindowOptions) => {
        setWindows((prev) => {
            const existing = prev.find((w) => w.id === id)
            if (existing) {
                focusWindow(id)
                return prev.map((w) => (w.id === id ? { ...w, isOpen: true, isMinimized: false } : w))
            }
            const newCtx = {
                id,
                title,
                content,
                isOpen: true,
                isMinimized: false,
                isMaximized: false,
                zIndex: maxZIndex + 1,
                icon,
                width: options?.width,
                height: options?.height,
            }
            setMaxZIndex(newCtx.zIndex)
            return [...prev, newCtx]
        })
    }

    const closeWindow = (id: string) => {
        setWindows((prev) => prev.filter((w) => w.id !== id))
    }

    const minimizeWindow = (id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
        )
    }

    const maximizeWindow = (id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
        )
        focusWindow(id)
    }

    const [showSnowfall, setShowSnowfall] = useState(true)

    const toggleSnowfall = () => setShowSnowfall(prev => !prev)

    return (
        <WindowContext.Provider
            value={{
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
                toggleSnowfall
            }}
        >
            {children}
        </WindowContext.Provider>
    )
}

export const useWindowManager = () => {
    const context = useContext(WindowContext)
    if (!context) throw new Error("useWindowManager must be used within a WindowProvider")
    return context
}
