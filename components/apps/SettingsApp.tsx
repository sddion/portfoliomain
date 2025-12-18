"use client"

import React from "react"
import { useTheme } from "next-themes"
import { Monitor, Cpu, Droplet, Ghost } from "lucide-react"

export function SettingsApp() {
    const { theme, setTheme } = useTheme()

    const themes = [
        { id: "dark", label: "Cyberpunk", color: "bg-[#00ff41]", icon: <Monitor size={20} /> },
        { id: "ubuntu", label: "Ubuntu", color: "bg-[#e95420]", icon: <Cpu size={20} /> },
        { id: "ocean", label: "Ocean", color: "bg-[#38bdf8]", icon: <Droplet size={20} /> },
        { id: "dracula", label: "Dracula", color: "bg-[#ff79c6]", icon: <Ghost size={20} /> },
    ]

    return (
        <div className="h-full bg-zinc-900 text-white p-4 sm:p-6 font-mono overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 border-b border-zinc-700 pb-2">Appearance Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded border transition-all hover:scale-[1.02] active:scale-95 min-h-[60px] ${theme === t.id
                            ? "border-white bg-white/10 ring-1 ring-white"
                            : "border-zinc-700 hover:bg-zinc-800"
                            }`}
                    >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-black ${t.color}`}>
                            {t.icon}
                        </div>
                        <span className="font-medium text-base sm:text-lg truncate">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-zinc-800 rounded text-xs sm:text-sm text-zinc-400">
                <p>Selected Theme: <span className="text-white font-bold uppercase">{theme}</span></p>
                <p className="mt-2">Themes affect window highlights, terminal text, and accents.</p>
            </div>
        </div>
    )
}
