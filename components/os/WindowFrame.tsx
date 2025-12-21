"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Square, Maximize2 } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { cn } from "@/lib/utils"

interface WindowFrameProps {
    id: string
    title: string
    children: React.ReactNode
    isMinimized: boolean
    isMaximized: boolean
    zIndex: number
    icon?: React.ReactNode
    width?: string
    height?: string
}

export const WindowFrame = React.memo(function WindowFrame({
    id,
    title,
    children,
    isMinimized,
    isMaximized,
    zIndex,
    icon,
    width = "800px",
    height = "600px",
}: WindowFrameProps) {
    const { closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useWindowManager()

    const handleClose = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        closeWindow(id)
    }, [id, closeWindow])

    const handleMinimize = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        minimizeWindow(id)
    }, [id, minimizeWindow])

    const handleMaximize = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        maximizeWindow(id)
    }, [id, maximizeWindow])

    const handleTitleDoubleClick = React.useCallback(() => {
        maximizeWindow(id)
    }, [id, maximizeWindow])

    const handleMouseDown = React.useCallback(() => {
        focusWindow(id)
    }, [id, focusWindow])

    if (isMinimized) return null

    return (
        <motion.div
            drag={!isMaximized}
            dragMomentum={false}
            dragConstraints={{ left: 0, top: 0, right: typeof window !== 'undefined' ? window.innerWidth - 100 : 0, bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 }}
            initial={{ scale: 0.9, opacity: 0, x: isMaximized ? 0 : "25vw", y: isMaximized ? 0 : "15vh" }}
            animate={{
                scale: 1,
                opacity: 1,
                width: isMaximized ? "100vw" : width,
                height: isMaximized ? "100vh" : height,
                x: isMaximized ? 0 : undefined,
                y: isMaximized ? 0 : undefined,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            onMouseDown={handleMouseDown}
            style={{ zIndex: isMaximized ? 9998 : zIndex }}
            className={cn(
                "absolute bg-[var(--os-surface)] border border-[var(--os-border)] shadow-xl overflow-hidden flex flex-col backdrop-blur-md",
                isMaximized ? "top-0 left-0 rounded-none" : "rounded-md"
            )}
        >
            {/* Title Bar */}
            <div
                className="h-9 bg-[var(--os-surface-hover)] border-b border-[var(--os-border)] flex items-center justify-between px-3 select-none cursor-default"
                onDoubleClick={handleTitleDoubleClick}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[var(--foreground)] text-sm font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMinimize}
                        className="p-1 hover:bg-white/10 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        onClick={handleMaximize}
                        className="p-1 hover:bg-white/10 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        {isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-[var(--destructive)]/50 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive-foreground)] transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-black/40 text-[var(--foreground)] relative">
                {children}
            </div>
        </motion.div>
    )
})
