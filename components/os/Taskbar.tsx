"use client"

import React, { useState, useEffect } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { format } from "date-fns"
import { Battery, Wifi, Volume2, Power } from "lucide-react"
import { motion } from "framer-motion"

export function Taskbar() {
    const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useWindowManager()
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed bottom-0 left-0 right-0 h-10 bg-zinc-900/95 border-t border-zinc-700 flex items-center justify-between px-2 z-[9999] backdrop-blur-sm">
            {/* Start Button / Menu */}
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded text-green-500 font-bold transition-colors">
                    <div className="w-4 h-4 rounded-sm bg-green-500 relative flex items-center justify-center">
                        <span className="text-black text-[10px] font-bold">_</span>
                    </div>
                    <span>Start</span>
                </button>
                <div className="w-[1px] h-6 bg-zinc-700 mx-1" />

                {/* Open Windows */}
                <div className="flex items-center gap-1">
                    {windows.map((win) => (
                        <button
                            key={win.id}
                            onClick={() => win.isMinimized ? focusWindow(win.id) : minimizeWindow(win.id)}
                            className={`
                px-3 py-1 text-xs truncate max-w-[150px] rounded flex items-center gap-2 transition-all
                ${!win.isMinimized && 'bg-zinc-800 border-b-2 border-green-500 text-white'}
                ${win.isMinimized && 'hover:bg-zinc-800/50 text-zinc-400'}
              `}
                        >
                            {win.icon && <span className="opacity-70">{win.icon}</span>}
                            {win.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* System Tray */}
            <div className="flex items-center gap-4 px-2 text-zinc-400 text-xs font-mono">
                <div className="flex items-center gap-3">
                    <Wifi size={14} />
                    <Volume2 size={14} />
                    <Battery size={14} />
                </div>
                <div className="w-[1px] h-6 bg-zinc-700 mx-1" />
                <span>{format(time, "HH:mm")}</span>
                <button className="hover:text-red-400 transition-colors">
                    <Power size={14} />
                </button>
            </div>
        </div>
    )
}
