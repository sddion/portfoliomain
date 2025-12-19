"use client"

import React from "react"
import { Power, Terminal, User, Folder, Briefcase, FileText, Github, CircuitBoard, Snowflake, Globe } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { motion, AnimatePresence } from "framer-motion"
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { ESP32FlasherApp } from "@/components/apps/ESP32FlasherApp"
import { BlogApp } from "@/components/apps/BlogApp"
import { BrowserApp } from "@/components/apps/BrowserApp"
import dynamic from "next/dynamic"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

interface StartMenuProps {
    isOpen: boolean
    onClose: () => void
}

export function StartMenu({ isOpen, onClose }: StartMenuProps) {
    const { openWindow, logout, toggleSnowfall, showSnowfall } = useWindowManager()

    const menuItems = [
        { label: "Terminal", icon: <Terminal size={18} className="text-green-500" />, id: "terminal", content: <TerminalApp /> },
        { label: "Projects", icon: <Folder size={18} className="text-yellow-500" />, id: "projects", content: <ProjectsApp /> },
        { label: "About Me", icon: <User size={18} className="text-blue-500" />, id: "about", content: <AboutApp /> },
        { label: "Experience", icon: <Briefcase size={18} className="text-purple-500" />, id: "experience", content: <ExperienceApp /> },
        { label: "Resume", icon: <FileText size={18} className="text-red-500" />, id: "resume", content: <ResumeApp /> },
        { label: "ESP Flasher", icon: <CircuitBoard size={18} className="text-orange-500" />, id: "esp32-flasher", content: <ESP32FlasherApp /> },
        { label: "Blog", icon: <FileText size={18} className="text-teal-500" />, id: "blog", content: <BlogApp /> },
        { label: "Browser", icon: <Globe size={18} className="text-blue-400" />, id: "browser", content: <BrowserApp /> },
        { label: "Snowfall", icon: <Snowflake size={18} className={showSnowfall ? "text-blue-300" : "text-zinc-500"} />, action: toggleSnowfall },
        { label: "GitHub", icon: <Github size={18} className="text-white" />, action: () => { openWindow("browser", "Browser", <BrowserApp initialUrl="https://github.com/sddion" />, <Globe size={18} />); } },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-12 left-2 w-64 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-tr-lg rounded-tl-lg shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-[var(--os-surface-hover)] p-3 border-b border-[var(--os-border)] flex items-center gap-2">
                            <img
                                src="https://avatars.githubusercontent.com/u/152778879?v=4"
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full shadow-lg object-cover"
                            />
                            <span className="font-bold text-[var(--foreground)]">SanjuOS</span>
                        </div>

                        {/* App List */}
                        <div className="p-2 space-y-1">
                            {menuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (item.action) item.action()
                                        else if (item.id) openWindow(item.id, item.label, (item as any).content, item.icon)
                                        onClose()
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-[var(--os-surface-hover)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Footer / Power */}
                        <div className="p-2 border-t border-[var(--os-border)] bg-black/20">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded transition-colors text-sm font-semibold"
                            >
                                <Power size={16} />
                                <span>Shutdown</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
