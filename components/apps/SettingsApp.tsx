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
        <div className="h-full bg-zinc-900 text-white p-6 font-mono">
            <h2 className="text-xl font-bold mb-6 border-b border-zinc-700 pb-2">Appearance Settings</h2>

            <div className="grid grid-cols-2 gap-4">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex items-center gap-4 p-4 rounded border transition-all hover:scale-[1.02] ${theme === t.id
                            ? "border-white bg-white/10 ring-1 ring-white"
                            : "border-zinc-700 hover:bg-zinc-800"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black ${t.color}`}>
                            {t.icon}
                        </div>
                        <span className="font-medium text-lg">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-8 p-4 bg-zinc-800 rounded text-sm text-zinc-400">
                <p>Selected Theme: <span className="text-white font-bold uppercase">{theme}</span></p>
                <p className="mt-2">Themes affect window highlights, terminal text, and accents.</p>
            </div>
        </div>
    )
}
