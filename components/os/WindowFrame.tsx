"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

    // Track window position
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [initialized, setInitialized] = useState(false)

    // Set initial position on mount (center of screen with slight offset based on zIndex)
    useEffect(() => {
        if (typeof window !== 'undefined' && !initialized) {
            const offset = (zIndex % 10) * 30
            setPosition({
                x: Math.max(50, (window.innerWidth - parseInt(width)) / 2 + offset),
                y: Math.max(50, (window.innerHeight - parseInt(height)) / 2 + offset)
            })
            setInitialized(true)
        }
    }, [width, height, zIndex, initialized])

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

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        focusWindow(id)
    }, [id, focusWindow])

    // Drag handlers for title bar
    const handleDragStart = (e: React.MouseEvent) => {
        if (isMaximized) return
        e.preventDefault()
        setIsDragging(true)
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        })
        focusWindow(id)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - 100))
            const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 100))
            setPosition({ x: newX, y: newY })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragStart])

    if (isMinimized) return null

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                width: isMaximized ? "100vw" : width,
                height: isMaximized ? "100vh" : height,
                x: isMaximized ? 0 : position.x,
                y: isMaximized ? 0 : position.y,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                x: { type: "tween", duration: isDragging ? 0 : 0.2 },
                y: { type: "tween", duration: isDragging ? 0 : 0.2 }
            }}
            onMouseDown={handleMouseDown}
            style={{
                zIndex: isMaximized ? 9998 : zIndex,
                position: 'absolute',
                top: 0,
                left: 0,
            }}
            className={cn(
                "bg-[var(--os-surface)] border border-[var(--os-border)] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md",
                isMaximized ? "rounded-none" : "rounded-lg",
                isDragging && "cursor-grabbing select-none"
            )}
        >
            {/* Title Bar - Draggable */}
            <div
                className={cn(
                    "h-9 bg-[var(--os-surface-hover)] border-b border-[var(--os-border)] flex items-center justify-between px-3 select-none",
                    !isMaximized && "cursor-grab",
                    isDragging && "cursor-grabbing"
                )}
                onDoubleClick={handleTitleDoubleClick}
                onMouseDown={handleDragStart}
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    {icon}
                    <span className="text-[var(--foreground)] text-sm font-medium">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleMinimize}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-white/10 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        onClick={handleMaximize}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-white/10 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        {isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
                    </button>
                    <button
                        onClick={handleClose}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-red-500/80 rounded text-[var(--muted-foreground)] hover:text-white transition-colors"
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
