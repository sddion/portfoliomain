"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react"

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

    const login = useCallback(() => {
        setIsLoggedIn(true)
        setBooting(true) // Trigger boot on login
        localStorage.setItem("sanjuos_login", Date.now().toString())
    }, [])

    const logout = useCallback(() => {
        setIsLoggedIn(false)
        setWindows([]) // Clear windows on logout
        setBooting(false)
        localStorage.removeItem("sanjuos_login")
    }, [])

    const focusWindow = useCallback((id: string) => {
        // Use a single setWindows call to handle both active ID and z-ordering
        // to avoid nested state updates and unnecessary re-renders.
        setWindows((prevWindows) => {
            const existing = prevWindows.find(w => w.id === id);

            // If window doesn't exist or is already focused and opened, do nothing.
            // We use a functional update for setActiveWindowId below.

            let updatedWindows = prevWindows;

            // Increment zIndex locally based on maxZIndex
            // Note: We'll update maxZIndex separately if needed, but for focus we can just use the current top + 1.
            const currentMaxZ = Math.max(...prevWindows.map(w => w.zIndex), 10);
            const newZ = currentMaxZ + 1;

            updatedWindows = prevWindows.map((w) =>
                w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w
            );

            // Only update active ID if it changed
            setActiveWindowId(id);
            setMaxZIndex(newZ);

            return updatedWindows;
        });
    }, []);

    const openWindow = useCallback((id: string, title: string, content: React.ReactNode, icon?: React.ReactNode, options?: WindowOptions) => {
        setWindows((prev) => {
            const existing = prev.find((w) => w.id === id);
            if (existing) {
                // If it exists, we update the content and options, then focus it.
                setActiveWindowId(id);
                setMaxZIndex((prevZ) => prevZ + 1);

                return prev.map((w) =>
                    w.id === id
                        ? {
                            ...w,
                            content: content, // Update content to catch prop changes (like initialUrl)
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

            setMaxZIndex(newZ);
            setActiveWindowId(id);
            return [...prev, newCtx];
        });
    }, []);

    const closeWindow = useCallback((id: string) => {
        setWindows((prev) => prev.filter((w) => w.id !== id))
        setActiveWindowId(prev => prev === id ? null : prev)
    }, [])

    const minimizeWindow = useCallback((id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
        )
    }, [])

    const maximizeWindow = useCallback((id: string) => {
        setWindows((prev) =>
            prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
        )
        // focusWindow is now stable (no dependencies), so we can call it safely
        focusWindow(id)
    }, [focusWindow])

    const [showSnowfall, setShowSnowfall] = useState(true)

    const toggleSnowfall = useCallback(() => setShowSnowfall(prev => !prev), [])

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
        toggleSnowfall
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
        toggleSnowfall
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
