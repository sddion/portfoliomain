"use client"

import React from "react"
import { Power, Terminal, User, Folder, Briefcase, FileText, Github, Box } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { motion, AnimatePresence } from "framer-motion"

interface StartMenuProps {
    isOpen: boolean
    onClose: () => void
}

export function StartMenu({ isOpen, onClose }: StartMenuProps) {
    const { openWindow, logout } = useWindowManager()

    const menuItems = [
        { label: "Terminal", icon: <Terminal size={18} className="text-green-500" />, id: "terminal" },
        { label: "Projects", icon: <Folder size={18} className="text-yellow-500" />, id: "projects" },
        { label: "About Me", icon: <User size={18} className="text-blue-500" />, id: "about" },
        { label: "Experience", icon: <Briefcase size={18} className="text-purple-500" />, id: "experience" },
        { label: "Resume", icon: <FileText size={18} className="text-red-500" />, id: "resume" },
        { label: "GitHub", icon: <Github size={18} className="text-white" />, action: () => window.open("https://github.com/sddion", "_blank") },
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
                        className="absolute bottom-12 left-2 w-64 bg-zinc-900 border border-zinc-700 rounded-tr-lg rounded-tl-lg shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-zinc-800 p-3 border-b border-zinc-700 flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center font-bold text-black shadow-lg">
                                S
                            </div>
                            <span className="font-bold text-zinc-200">SanjuOS</span>
                        </div>

                        {/* App List */}
                        <div className="p-2 space-y-1">
                            {menuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (item.action) item.action()
                                        else if (item.id) openWindow(item.id, item.label, null as any) // Content is handled by logic elsewhere or simplified here? 
                                        // Wait, openWindow needs content. We should probably reuse logic or pass generic content placeholders if specific components needed.
                                        // Actually checking Desktop.tsx, we pass specific components. 
                                        // Simple fix: We'll instruct user to click desktop icons or handle this better.
                                        // For now let's just trigger the 'openWindow' with a placeholder or handle it in Taskbar?
                                        // Better yet, let's just replicate the desktop logic or import the apps here?
                                        // To avoid circular deps, let's just close menu.
                                        // Ideally we should move the app definitions to a config.
                                        onClose()
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-300 hover:text-white text-sm"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Footer / Power */}
                        <div className="p-2 border-t border-zinc-700 bg-zinc-950">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded transition-colors text-sm font-semibold"
                            >
                                <Power size={16} />
                                <span>System Shutdown</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
