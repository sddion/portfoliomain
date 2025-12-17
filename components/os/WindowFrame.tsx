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
}

export function WindowFrame({
    id,
    title,
    children,
    isMinimized,
    isMaximized,
    zIndex,
    icon,
}: WindowFrameProps) {
    const { closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useWindowManager()

    if (isMinimized) return null

    return (
        <motion.div
            drag={!isMaximized}
            dragMomentum={false}
            dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                width: isMaximized ? "100vw" : "800px",
                height: isMaximized ? "calc(100vh - 48px)" : "600px",
                x: isMaximized ? 0 : undefined,
                y: isMaximized ? 0 : undefined,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            onMouseDown={() => focusWindow(id)}
            style={{ zIndex }}
            className={cn(
                "absolute bg-zinc-900 border border-zinc-700 shadow-xl overflow-hidden flex flex-col",
                isMaximized ? "top-0 left-0 rounded-none" : "rounded-md"
            )}
        >
            {/* Title Bar */}
            <div
                className="h-9 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-3 select-none cursor-default"
                onDoubleClick={() => maximizeWindow(id)}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-zinc-300 text-sm font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); maximizeWindow(id); }}
                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    >
                        {isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
                        className="p-1 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-zinc-950/90 text-zinc-200 relative">
                {children}
            </div>
        </motion.div>
    )
}
