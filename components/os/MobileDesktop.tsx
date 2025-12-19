"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { useNotifications } from "@/hooks/useNotifications"
import { Battery, Wifi, Volume2, Search, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Image as ImageIcon, Settings, MessageCircle, CircuitBoard, X, Minus, Activity, Cpu, Radio } from "lucide-react"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { SettingsApp } from "@/components/apps/SettingsApp"
import { ESP32FlasherApp } from "@/components/apps/ESP32FlasherApp"
import { BlogApp } from "@/components/apps/BlogApp"
import { ResourceMonitorApp } from "@/components/apps/ResourceMonitorApp"
import { IoTControlApp } from "@/components/apps/IoTControlApp"
import dynamic from "next/dynamic"

import { NotificationShade } from "@/components/os/NotificationShade"
import { MobileConkyWidget } from "@/components/os/MobileConkyWidget"
import { AdWidget } from "@/components/os/AdWidget"
import { SnowfallEffect } from "@/components/ui/snowfall-effect"
import { LoginScreen } from "@/components/os/LoginScreen"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

export function MobileDesktop() {
    const { windows, openWindow, closeWindow, activeWindowId, isLoggedIn } = useWindowManager()
    const [time, setTime] = useState(new Date())
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [isRecentsOpen, setIsRecentsOpen] = useState(false)

    // Handle home state in history
    React.useEffect(() => {
        if (isLoggedIn) {
            window.history.replaceState({ appId: 'home' }, "", "/")
        }
    }, [isLoggedIn])

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    React.useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (isRecentsOpen) {
                setIsRecentsOpen(false)
                return
            }

            if (activeWindowId) {
                // Formatting back functionality to be standard:
                // If the user navigates back (popstate), we effectively close the current window
                // provided the new state isn't the same app (which shouldn't happen with our pushes)
                if (!event.state || event.state.appId !== activeWindowId) {
                    closeWindow(activeWindowId)
                }
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [activeWindowId, closeWindow, isRecentsOpen])

    const apps = [
        {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal className="text-white" size={24} />,
            bg: "bg-zinc-800",
            content: <TerminalApp />,
        },
        {
            id: "sys-monitor",
            label: "Monitor",
            icon: <Activity className="text-white" size={24} />,
            bg: "bg-emerald-600",
            content: <ResourceMonitorApp />,
        },
        {
            id: "iot-control",
            label: "IoT",
            icon: <Cpu className="text-white" size={24} />,
            bg: "bg-blue-600",
            content: <IoTControlApp />,
        },
        {
            id: "about",
            label: "About Me",
            icon: <User className="text-blue-400" size={24} />,
            bg: "bg-zinc-800",
            content: <AboutApp />,
        },
        {
            id: "projects",
            label: "Projects",
            icon: <Folder className="text-yellow-400" size={24} />,
            bg: "bg-zinc-800",
            content: <ProjectsApp />,
        },
        {
            id: "experience",
            label: "Experience",
            icon: <Briefcase className="text-purple-400" size={24} />,
            bg: "bg-zinc-800",
            content: <ExperienceApp />,
        },
        {
            id: "resume",
            label: "Resume",
            icon: <FileText className="text-red-400" size={24} />,
            bg: "bg-zinc-800",
            content: <ResumeApp />,
        },
        {
            id: "github",
            label: "GitHub",
            icon: <Github className="text-white" size={24} />,
            bg: "bg-black",
            action: () => window.open("https://github.com/sddion", "_blank"),
        },
        {
            id: "gitlab",
            label: "GitLab",
            icon: <Gitlab className="text-white" size={24} />,
            bg: "bg-orange-600",
            action: () => window.open("https://gitlab.com/0xd3ds3c", "_blank"),
        },
        {
            id: "instagram",
            label: "Instagram",
            icon: <Instagram className="text-white" size={24} />,
            bg: "bg-pink-600",
            action: () => window.open("https://instagram.com/wordswires", "_blank"),
        },
        {
            id: "blog",
            label: "Blog",
            icon: <FileText className="text-teal-400" size={24} />,
            bg: "bg-teal-600",
            content: <BlogApp />,
        },
        {
            id: "esp32-flasher",
            label: "ESP Flasher",
            icon: <CircuitBoard className="text-orange-500" size={24} />,
            bg: "bg-orange-600",
            content: <ESP32FlasherApp />,
        },
        {
            id: "settings",
            label: "Settings",
            icon: <Settings className="text-zinc-400" size={24} />,
            bg: "bg-zinc-800",
            content: <SettingsApp />,
        },
        {
            id: "whatsapp",
            label: "WhatsApp",
            icon: <MessageCircle className="text-green-500" size={24} />,
            bg: "bg-green-600",
            action: () => window.open("https://wa.me/91882292607", "_blank"),
        },
    ]

    const activeApp = apps.find(app => windows.find(w => w.id === app.id)?.isOpen)

    const handleAppClick = (app: any) => {
        if (app.action) {
            app.action()
        } else {
            // Push state so back button works
            window.history.pushState({ appId: app.id }, "", `#${app.id}`)
            openWindow(app.id, app.label, app.content)
            setIsRecentsOpen(false)
        }
    }

    const goHome = () => {
        if (activeWindowId) {
            window.history.pushState({ appId: 'home' }, "", "/")
            closeWindow(activeWindowId)
        }
        setIsRecentsOpen(false)
    }

    const toggleRecents = () => {
        setIsRecentsOpen(prev => !prev)
    }

    // Split apps into pages: 8 on first page (2x4), rest on second
    const appsPerPage = 8
    const page1Apps = apps.slice(0, appsPerPage)
    const page2Apps = apps.slice(appsPerPage)
    const totalPages = page2Apps.length > 0 ? 2 : 1

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    return (
        <div className="h-screen w-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden relative font-sans">
            <SnowfallEffect />
            {/* Status Bar - Non-interactive background */}
            <div className="absolute top-0 left-0 right-0 z-40 px-6 pt-2 pb-1 flex items-center justify-between text-[var(--foreground)] text-xs bg-gradient-to-b from-[var(--background)]/80 to-transparent pointer-events-none">
                <span className="font-semibold">{format(time, "HH:mm")}</span>
                <div className="flex items-center gap-2">
                    <Wifi size={16} className="opacity-80" />
                    <Battery size={16} className="opacity-80" />
                </div>
            </div>

            {/* Notification Shade Pull Handle */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-10 z-[60] flex justify-center py-1 cursor-grab active:cursor-grabbing"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 60) {
                        setNotificationOpen(true)
                    }
                }}
            >
                <div className="w-12 h-1 bg-white/30 rounded-full" />
            </motion.div>

            <NotificationShade isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

            {/* Recents Task Switcher */}
            <AnimatePresence>
                {isRecentsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                        onClick={() => setIsRecentsOpen(false)}
                    >
                        <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-12">Recents</div>
                        <div className="w-full flex gap-6 overflow-x-auto px-12 pb-12 snap-x no-scrollbar">
                            {windows.length === 0 ? (
                                <div className="w-full text-center text-white/30 py-20">No active apps</div>
                            ) : (
                                windows.map((win) => {
                                    const app = apps.find(a => a.id === win.id)
                                    return (
                                        <motion.div
                                            key={win.id}
                                            whileTap={{ scale: 0.95 }}
                                            className="min-w-[240px] aspect-[9/16] bg-[var(--os-surface)] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative snap-center flex flex-col"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAppClick(app)
                                            }}
                                        >
                                            <div className="p-4 flex items-center gap-3 border-b border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    {app?.icon}
                                                </div>
                                                <span className="text-sm font-bold">{win.title}</span>
                                            </div>
                                            <div className="flex-1 bg-black/20 flex items-center justify-center">
                                                <div className="opacity-20 transform scale-150">
                                                    {app?.icon}
                                                </div>
                                            </div>
                                            <button
                                                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    closeWindow(win.id)
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="h-full pt-12 pb-20 px-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeApp ? (
                        <motion.div
                            key="app-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full bg-[var(--background)] rounded-2xl overflow-hidden relative border border-[var(--os-border)] shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 right-0 h-10 bg-[var(--os-surface)]/90 backdrop-blur-md border-b border-[var(--os-border)] flex items-center justify-between px-4 z-50">
                                <span className="text-xs font-bold opacity-70 tracking-wide">{activeApp.label}</span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={goHome}
                                        className="p-1.5 rounded-full bg-yellow-500/20 text-yellow-500 active:scale-90 transition-transform"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            closeWindow(activeApp.id)
                                            window.history.back() // Sync history
                                        }}
                                        className="p-1.5 rounded-full bg-red-500/20 text-red-500 active:scale-90 transition-transform"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-full pt-14 pb-4 px-2 overflow-y-auto custom-scrollbar">
                                {activeApp.content}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="home-screen"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col pb-14"
                        >
                            <div className="px-4 pb-4">
                                {/* Deprecated here, moved to Page 1 specific render */}
                            </div>

                            {/* App Grid Container - Flex-grow to push pagination down */}
                            <div className="flex-1 flex items-start pt-6 relative">
                                {/* App Grid with Swipe */}
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: totalPages > 1 ? -window.innerWidth : 0, right: 0 }}
                                    dragElastic={0.1}
                                    onDragEnd={(_, info) => {
                                        if (totalPages > 1) {
                                            if (info.offset.x < -50 && currentPage === 0) {
                                                setCurrentPage(1)
                                            } else if (info.offset.x > 50 && currentPage === 1) {
                                                setCurrentPage(0)
                                            }
                                        }
                                    }}
                                    animate={{ x: currentPage === 0 ? 0 : -window.innerWidth }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex w-full"
                                >
                                    {/* Page 1 */}
                                    <div className="min-w-full px-4 flex flex-col">
                                        {/* Mobile Conky Widget - Only on Page 1 */}
                                        <div className="pt-6 pb-4 space-y-4">
                                            <MobileConkyWidget />
                                            <AdWidget />
                                        </div>

                                        <div className="grid grid-cols-4 grid-rows-2 gap-y-8 gap-x-4 pt-2">
                                            {page1Apps.map((app) => (
                                                <button
                                                    key={app.id}
                                                    onClick={() => handleAppClick(app)}
                                                    className="flex flex-col items-center gap-2 group"
                                                >
                                                    <div className={`w-14 h-14 ${app.bg === 'bg-zinc-800' ? 'bg-[var(--os-surface)]' : app.bg} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                                                        {app.icon}
                                                    </div>
                                                    <span className="text-[10px] text-[var(--muted-foreground)] font-medium tracking-wide">{app.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Page 2 */}
                                    {totalPages > 1 && (
                                        <div className="min-w-full pl-12 pr-0 grid grid-cols-4 grid-rows-4 auto-rows-max gap-y-8 gap-x-4 pt-6 content-start">
                                            {page2Apps.map((app) => (
                                                <button
                                                    key={app.id}
                                                    onClick={() => handleAppClick(app)}
                                                    className="flex flex-col items-center gap-2 group h-min"
                                                >
                                                    <div className={`w-14 h-14 ${app.bg === 'bg-zinc-800' ? 'bg-[var(--os-surface)]' : app.bg} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                                                        {app.icon}
                                                    </div>
                                                    <span className="text-[10px] text-[var(--muted-foreground)] font-medium tracking-wide">{app.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Page Indicators - Absolutely positioned to prevent layout shift */}
                                {totalPages > 1 && (
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-2 pointer-events-none">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i)}
                                                className={`h-1.5 rounded-full transition-all pointer-events-auto ${i === currentPage
                                                    ? 'w-6 bg-white'
                                                    : 'w-1.5 bg-zinc-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dock / Home Indicator */}
            <div
                className="absolute bottom-2 left-0 right-0 flex justify-center py-4 z-[80] cursor-pointer"
                onClick={goHome}
                onContextMenu={(e) => {
                    e.preventDefault()
                    toggleRecents()
                }}
            >
                <motion.div
                    whileTap={{ scaleX: 1.2, opacity: 1 }}
                    className="w-32 h-1 bg-white/40 rounded-full"
                />
            </div>

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center -z-10 transition-[background-image] duration-500 ease-in-out bg-[var(--background)]"
                style={{ backgroundImage: "var(--mobile-bg)" }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </div>
        </div>
    )
}
