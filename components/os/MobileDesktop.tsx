"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { Battery, Wifi, Volume2, Search, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram } from "lucide-react"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import dynamic from "next/dynamic"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

export function MobileDesktop() {
    const { windows, openWindow, closeWindow, activeWindowId } = useWindowManager()
    const [time, setTime] = useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

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
    ]

    const activeApp = apps.find(app => windows.find(w => w.id === app.id)?.isOpen)

    const handleAppClick = (app: any) => {
        if (app.action) {
            app.action()
        } else {
            openWindow(app.id, app.label, app.content)
        }
    }

    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative font-sans">

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-50 pointer-events-none">
                <span className="font-bold text-sm tracking-wide">{format(time, "HH:mm")}</span>
                <div className="flex items-center gap-2">
                    <Wifi size={16} />
                    <Battery size={16} />
                </div>
            </div>

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
                                <button
                                    onClick={() => closeWindow(activeApp.id)}
                                    className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
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
                            {/* App Grid */}
                            <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                                {apps.map((app) => (
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Dock / Home Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center py-4 z-50">
                <div className="w-32 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black -z-10" />
        </div>
    )
}
