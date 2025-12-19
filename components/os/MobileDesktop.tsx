"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { useNotifications } from "@/hooks/useNotifications"
import { Battery, Wifi, Volume2, Search, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Image as ImageIcon, Settings, MessageCircle, CircuitBoard, X, Minus, Activity, Cpu, Radio, Globe, Maximize2 } from "lucide-react"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { SettingsApp } from "@/components/apps/SettingsApp"
import { ESP32FlasherApp } from "@/components/apps/ESP32FlasherApp"
import { BlogApp } from "@/components/apps/BlogApp"
import { TaskMonitor } from "@/components/apps/TaskMonitor"
import { IoTControlApp } from "@/components/apps/IoTControlApp"
import dynamic from "next/dynamic"

import { NotificationShade } from "@/components/os/NotificationShade"
import { MobileConkyWidget } from "@/components/os/MobileConkyWidget"
import { BrowserApp } from "@/components/apps/BrowserApp"
import { SnowfallEffect } from "@/components/ui/snowfall-effect"
import { LoginScreen } from "@/components/os/LoginScreen"
import { PWAInstall } from "@/components/os/PWAInstall"
import { cn } from "@/lib/utils"

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
            label: "Task Monitor",
            icon: <Activity className="text-white" size={24} />,
            bg: "bg-emerald-600",
            content: <TaskMonitor />,
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
            id: "browser",
            label: "Browser",
            icon: <Globe className="text-white" size={24} />,
            bg: "bg-blue-600",
            content: <BrowserApp />,
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

    ]

    const activeApp = apps.find(app => windows.find(w => w.id === app.id)?.isOpen)

    const handleAppClick = (app: any) => {
        if (app.action) {
            app.action()
        } else {
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

    const appsPerPage = 8
    const page1Apps = apps.slice(0, appsPerPage)
    const page2Apps = apps.slice(appsPerPage)
    const totalPages = page2Apps.length > 0 ? 2 : 1

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    return (
        <div
            className="h-[100dvh] w-screen bg-cover bg-center text-[var(--foreground)] overflow-hidden relative font-sans transition-[background-image] duration-500 ease-in-out"
            style={{
                backgroundImage: "var(--mobile-bg)",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <SnowfallEffect />

            {/* Status Bar - Always on top */}
            <div
                className="absolute top-0 left-0 right-0 z-[150] px-6 h-12 flex items-center justify-between text-[var(--foreground)] text-xs bg-gradient-to-b from-black/40 to-transparent cursor-pointer transition-colors backdrop-blur-[2px]"
                onClick={() => setNotificationOpen(prev => !prev)}
            >
                <span className="font-bold tracking-tight">{format(time, "HH:mm")}</span>
                <div className="flex items-center gap-3">
                    <Wifi size={16} className="opacity-90" />
                    <div className="flex items-center gap-0.5">
                        <span className="text-[9px] font-black mr-0.5">5G</span>
                        <Battery size={18} className="opacity-90" />
                    </div>
                </div>
            </div>

            {/* Notification Shade Pull Handle */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-10 z-[160] flex justify-center py-1 cursor-grab active:cursor-grabbing"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 60) {
                        setNotificationOpen(true)
                    }
                }}
            >
                <div className="w-12 h-1 bg-white/20 rounded-full" />
            </motion.div>

            <NotificationShade isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

            {/* Recents Task Switcher */}
            <AnimatePresence>
                {isRecentsOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[170] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
                        onClick={() => setIsRecentsOpen(false)}
                    >
                        <div className="text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-12">Recent Applications</div>
                        <div className="w-full flex gap-6 overflow-x-auto px-12 pb-12 snap-x no-scrollbar">
                            {windows.length === 0 ? (
                                <div className="w-full text-center text-white/30 py-20 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center opacity-50">
                                        <Activity size={32} />
                                    </div>
                                    <span className="text-sm">No active processes</span>
                                </div>
                            ) : (
                                windows.map((win) => {
                                    const app = apps.find(a => a.id === win.id)
                                    return (
                                        <motion.div
                                            key={win.id}
                                            whileTap={{ scale: 0.95 }}
                                            className="min-w-[260px] aspect-[9/18.5] bg-[var(--os-surface)] rounded-[2.5rem] border border-white/10 shadow-huge overflow-hidden relative snap-center flex flex-col group"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleAppClick(app)
                                            }}
                                        >
                                            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", app?.bg)}>
                                                        {app?.icon}
                                                    </div>
                                                    <span className="text-sm font-black tracking-tight">{win.title}</span>
                                                </div>
                                                <button
                                                    className="p-2.5 bg-red-500/20 text-red-400 rounded-full active:scale-90 transition-transform"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        closeWindow(win.id)
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="flex-1 bg-black/40 flex items-center justify-center relative">
                                                <div className="absolute inset-x-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent top-0" />
                                                <div className="opacity-10 transform scale-[2] blur-[1px]">
                                                    {app?.icon}
                                                </div>
                                                <div className="absolute bottom-6 text-[10px] text-white/20 font-mono uppercase tracking-widest">Process Preview</div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Immersive App Layer */}
            <AnimatePresence mode="popLayout">
                {activeApp && (
                    <motion.div
                        key="app-overlay"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col overflow-hidden"
                    >
                        {/* App Toolbar - Immersive style */}
                        <div className="pt-12 px-6 pb-4 flex items-center justify-between bg-[var(--os-surface)] border-b border-[var(--os-border)] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shadow-md", activeApp.bg)}>
                                    {React.cloneElement(activeApp.icon as React.ReactElement<any>, { size: 18 })}
                                </div>
                                <span className="text-sm font-black tracking-tight">{activeApp.label}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={goHome}
                                    className="p-2.5 rounded-full bg-zinc-800 text-zinc-400 active:bg-zinc-700 active:scale-90 transition-all border border-white/5"
                                >
                                    <Minus size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        closeWindow(activeApp.id)
                                        window.history.back()
                                    }}
                                    className="p-2.5 rounded-full bg-red-500/10 text-red-500 active:bg-red-500/20 active:scale-90 transition-all border border-red-500/10"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* App Content - Full Screen Padding Adjustment */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            {activeApp.content}
                        </div>

                        {/* Immersive Bottom Spacing for Home Indicator */}
                        <div className="h-14 shrink-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Home Screen Layer - No scroll, fixed viewport */}
            <div className={cn(
                "h-full w-full pt-12 pb-16 px-4 overflow-hidden transition-all duration-500",
                activeApp ? "opacity-0 scale-95 blur-xl pointer-events-none" : "opacity-100 scale-100 blur-0"
            )}>
                <div className="h-full flex flex-col">
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        {/* Status Widget Area */}
                        <div className="pt-2 pb-2">
                            <MobileConkyWidget />
                        </div>

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
                            className="flex flex-1 w-full"
                        >
                            {/* Page 1 */}
                            <div className="min-w-full px-2 flex flex-col h-full overflow-hidden">
                                <div className="grid grid-cols-4 gap-y-8 gap-x-4 pt-4">
                                    {page1Apps.map((app) => (
                                        <button
                                            key={app.id}
                                            onClick={() => handleAppClick(app)}
                                            className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
                                        >
                                            <div className={cn(
                                                "w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center shadow-xl relative overflow-hidden",
                                                app.bg === 'bg-zinc-800' ? 'bg-[var(--os-surface)]' : app.bg
                                            )}>
                                                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                                {React.cloneElement(app.icon as React.ReactElement<any>, { size: 28 })}
                                            </div>
                                            <span className="text-[10px] text-white/80 font-bold tracking-tight truncate w-full text-center">{app.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Page 2 */}
                            {totalPages > 1 && (
                                <div className="min-w-full px-2 flex flex-col h-full overflow-hidden">
                                    <div className="grid grid-cols-4 gap-y-8 gap-x-4 pt-4">
                                        {page2Apps.map((app) => (
                                            <button
                                                key={app.id}
                                                onClick={() => handleAppClick(app)}
                                                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
                                            >
                                                <div className={cn(
                                                    "w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center shadow-xl relative overflow-hidden",
                                                    app.bg === 'bg-zinc-800' ? 'bg-[var(--os-surface)]' : app.bg
                                                )}>
                                                    <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                                    {React.cloneElement(app.icon as React.ReactElement<any>, { size: 28 })}
                                                </div>
                                                <span className="text-[10px] text-white/80 font-bold tracking-tight truncate w-full text-center">{app.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Page Indicators */}
                        {totalPages > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === currentPage ? "w-6 bg-white" : "w-1 bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gesture Navigation / Home Indicator */}
            <div
                className="absolute bottom-0 left-0 right-0 flex justify-center pt-8 pb-4 z-[200] cursor-pointer group"
                onClick={goHome}
                onContextMenu={(e) => {
                    e.preventDefault()
                    toggleRecents()
                }}
            >
                {/* Swipe area hint */}
                <div className="absolute bottom-8 w-40 h-12 bg-white/0 rounded-full -translate-y-4" />

                <motion.div
                    whileTap={{ scaleX: 1.5, opacity: 1, height: 6 }}
                    className="w-36 h-1.5 bg-white/30 rounded-full group-hover:bg-white/50 transition-all shadow-lg backdrop-blur-md"
                />
                <div className="absolute bottom-1 text-[8px] text-white/20 font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Swipe up to Home</div>
            </div>

            {/* Global Scanlines for Android Retro Feel */}
            <div className="crt-effect pointer-events-none opacity-[0.03] z-[999]" />
            <PWAInstall />
        </div>
    )
}
