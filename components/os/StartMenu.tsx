"use client"

import React from "react"
import { Power, Snowflake, Globe, Github } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { motion, AnimatePresence } from "framer-motion"
import { BrowserApp } from "@/components/apps/BrowserApp"

interface StartMenuProps {
    isOpen: boolean
    onClose: () => void
}

import { AppIcon } from "@/components/os/IconManager"

export function StartMenu({ isOpen, onClose }: StartMenuProps) {
    const { openWindow, logout, toggleSnowfall, showSnowfall, installedApps } = useWindowManager()

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
                            <span className="font-bold text-[var(--foreground)]">sddionOS</span>
                        </div>

                        {/* App List */}
                        <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
                            {installedApps.map((app) => (
                                <button
                                    key={app.id}
                                    onClick={() => {
                                        onClose()
                                        requestAnimationFrame(() => {
                                            openWindow(app.id, app.title, app.component, <AppIcon iconName={app.iconName} size={18} />, { width: app.width, height: app.height })
                                        })
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-[var(--os-surface-hover)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
                                >
                                    <AppIcon iconName={app.iconName} size={18} className={app.iconColor || "text-[var(--primary)]"} />
                                    <span className="truncate">{app.title}</span>
                                </button>
                            ))}

                            {/* System Actions Separator */}
                            <div className="h-px bg-[var(--os-border)] my-2" />

                            {/* Static System Actions */}
                            <button
                                onClick={() => {
                                    onClose()
                                    requestAnimationFrame(() => {
                                        openWindow("browser", "Browser", <BrowserApp initialUrl="https://github.com/sddion" />, <AppIcon iconName="globe" size={18} />)
                                    })
                                }}
                                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--os-surface-hover)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
                            >
                                <AppIcon iconName="globe" size={18} className="text-[var(--primary)]" />
                                <span>GitHub</span>
                            </button>

                            <button
                                onClick={toggleSnowfall}
                                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--os-surface-hover)] rounded transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
                            >
                                <Snowflake size={18} className={showSnowfall ? "text-blue-300" : "text-zinc-500"} />
                                <span>Snowfall</span>
                            </button>
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
