"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { AnimatePresence } from "framer-motion"
import { BootSequence } from "@/components/os/BootSequence"
import { Taskbar } from "@/components/os/Taskbar"
import { WindowFrame } from "@/components/os/WindowFrame"
import { DesktopIcon } from "./DesktopIcon"
import { ConkyWidget } from "@/components/os/ConkyWidget"
import { LoginScreen } from "@/components/os/LoginScreen"
import { SnowfallEffect } from "@/components/ui/snowfall-effect"
import { useNotifications } from "@/hooks/useNotifications"

import { AppIcon } from "@/components/os/IconManager"

export function Desktop() {
    const { isBooting, setBooting, windows, openWindow, isLoggedIn, settings, updateSettings, installedApps, isAppsLoaded } = useWindowManager()
    const { showNotification } = useNotifications()

    // Recruiter Detection
    React.useEffect(() => {
        if (typeof window !== "undefined" && isLoggedIn) {
            const params = new URLSearchParams(window.location.search)
            if (params.get("ref") === "recruiter" && !settings.isRecruiter) {
                updateSettings({ isRecruiter: true })

                // Show personalized greeting
                showNotification("Recruiter Access Detected", {
                    body: "Welcome! I've personalized the OS for your visit. Feel free to explore my projects and resume.",
                    icon: "favicon.png"
                })
            }
        }
    }, [isLoggedIn, settings.isRecruiter, updateSettings, showNotification])

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    if (isBooting) {
        return <BootSequence onComplete={() => setBooting(false)} />
    }

    return (
        <div
            className="h-screen w-screen overflow-hidden bg-cover bg-center text-white relative transition-[background-image] duration-500 ease-in-out"
            style={{ backgroundImage: settings.wallpaper ? `url(${settings.wallpaper})` : "var(--desktop-bg)" }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

            {/* Conky Widget */}
            <ConkyWidget />

            {/* Snowfall Effect */}
            <SnowfallEffect />

            {/* CRT Scanline Effect */}
            <div className="crt-effect pointer-events-none" />

            {/* Desktop Icons Grid */}
            <div className="relative z-0 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit h-[calc(100vh-40px)]">
                {!isAppsLoaded ? (
                    // Skeleton Loader
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-2 w-[80px] animate-pulse">
                            <div className="w-12 h-12 rounded bg-white/10" />
                            <div className="w-16 h-3 rounded bg-white/10" />
                        </div>
                    ))
                ) : (
                    installedApps.map((app) => (
                        <DesktopIcon
                            key={app.id}
                            label={app.title}
                            icon={<AppIcon iconName={app.iconName} size={42} className="text-[var(--primary)] drop-shadow-md" />}
                            onDoubleClick={() => {
                                requestAnimationFrame(() => {
                                    openWindow(app.id, app.title, app.component, <AppIcon iconName={app.iconName} size={18} />, { width: app.width, height: app.height })
                                })
                            }}
                        />
                    ))
                )}
            </div>

            {/* Windows */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {windows.map((win) => (
                        <div key={win.id} className="pointer-events-auto">
                            <WindowFrame {...win}>{win.content}</WindowFrame>
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            <Taskbar />
        </div>
    )
}
