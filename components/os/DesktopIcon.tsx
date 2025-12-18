"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface DesktopIconProps {
    label: string
    icon: React.ReactNode
    onDoubleClick: () => void
}

export function DesktopIcon({ label, icon, onDoubleClick }: DesktopIconProps) {
    return (
        <button
            onDoubleClick={onDoubleClick}
            className="group flex flex-col items-center gap-1 w-24 p-2 rounded hover:bg-[var(--os-surface-hover)] focus:bg-[var(--os-surface-hover)] focus:outline-none transition-colors cursor-pointer text-shadow"
        >
            <div className="filter drop-shadow-lg group-hover:scale-105 transition-transform duration-200">
                {icon}
            </div>
            <span className="text-xs text-[var(--foreground)] text-center font-medium drop-shadow-md select-none bg-[var(--os-surface)] px-1 rounded">
                {label}
            </span>
        </button>
    )
}
