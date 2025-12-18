"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { Battery, Wifi, Volume2, Search, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Image, Settings, MessageCircle } from "lucide-react"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { CreditsApp } from "@/components/apps/CreditsApp"
import { SettingsApp } from "@/components/apps/SettingsApp"
import dynamic from "next/dynamic"

import { NotificationShade } from "@/components/os/NotificationShade"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

export function MobileDesktop() {
    const { windows, openWindow, closeWindow, activeWindowId } = useWindowManager()
    const [time, setTime] = useState(new Date())
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    React.useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // Only close if we're navigating AWAY from the current app (e.g. back to desktop)
            if (activeWindowId && event.state?.appId !== activeWindowId) {
                closeWindow(activeWindowId)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [activeWindowId, closeWindow])

    const apps = [
        {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal className="text-green-500" size={24} />,
            bg: "bg-zinc-800",
            content: <TerminalApp />,
        },
        {
            id: "about",
            label: "About",
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
            action: () => window.open("https://gitlab.com/0xdeds3c", "_blank"),
        },
        {
            id: "instagram",
            label: "Instagram",
            icon: <Instagram className="text-white" size={24} />,
            bg: "bg-pink-600",
            action: () => window.open("https://instagram.com/wordswires", "_blank"),
        },
        {
            id: "credits",
            label: "Credits",
            icon: <Image className="text-yellow-400" size={24} />,
            bg: "bg-zinc-800",
            content: <CreditsApp />,
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
        }
    }

    // Split apps into pages: 8 on first page (2x4), rest on second
    const appsPerPage = 8
    const page1Apps = apps.slice(0, appsPerPage)
    const page2Apps = apps.slice(appsPerPage)
    const totalPages = page2Apps.length > 0 ? 2 : 1

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative font-sans">

            {/* Status Bar */}
            <div
                className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50 cursor-pointer"
                onClick={() => setNotificationOpen(true)}
            >
                <span className="font-bold text-sm tracking-wide">{format(time, "HH:mm")}</span>
                <div className="flex items-center gap-2">
                    <Wifi size={16} />
                    <Battery size={16} />
                </div>
            </div>

            <NotificationShade isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />

            {/* Content Area */}
            <div className="h-full pt-12 pb-20 px-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeApp ? (
                        <motion.div
                            key="app-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-800 shadow-2xl"
                        >
                            <div className="absolute top-4 left-4 z-50">
                                {/* Back button removed for native navigation */}
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
                            className="h-full flex flex-col justify-end pb-8"
                        >
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
                                <div className="min-w-full px-4 grid grid-cols-4 grid-rows-2 gap-y-8 gap-x-4">
                                    {page1Apps.map((app) => (
                                        <button
                                            key={app.id}
                                            onClick={() => handleAppClick(app)}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={`w-14 h-14 ${app.bg} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                                                {app.icon}
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-medium tracking-wide">{app.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Page 2 */}
                                {totalPages > 1 && (
                                    <div className="min-w-full px-4 grid grid-cols-4 grid-rows-2 gap-y-8 gap-x-4">
                                        {page2Apps.map((app) => (
                                            <button
                                                key={app.id}
                                                onClick={() => handleAppClick(app)}
                                                className="flex flex-col items-center gap-2 group"
                                            >
                                                <div className={`w-14 h-14 ${app.bg} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform`}>
                                                    {app.icon}
                                                </div>
                                                <span className="text-[10px] text-zinc-400 font-medium tracking-wide">{app.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Page Indicators */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === currentPage
                                                    ? 'w-6 bg-white'
                                                    : 'w-1.5 bg-zinc-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dock / Home Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center py-4 z-50">
                <div className="w-32 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center -z-10 transition-[background-image] duration-500 ease-in-out bg-zinc-900"
                style={{ backgroundImage: "var(--mobile-bg)" }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            </div>
        </div>
    )
}
