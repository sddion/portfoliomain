"use client"

import React, { useEffect } from "react"
import { useTheme } from "next-themes"
import { Monitor, Cpu, Droplet, Ghost } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"

export function SettingsApp() {
    const { theme, setTheme } = useTheme()
    const { settings, updateSettings } = useWindowManager()

    const themes = [
        { id: "dark", label: "Cyberpunk", color: "bg-[#00ff41]", icon: <Monitor size={20} /> },
        { id: "ubuntu", label: "Ubuntu", color: "bg-[#e95420]", icon: <Cpu size={20} /> },
        { id: "ocean", label: "Ocean", color: "bg-[#38bdf8]", icon: <Droplet size={20} /> },
        { id: "dracula", label: "Dracula", color: "bg-[#ff79c6]", icon: <Ghost size={20} /> },
    ]

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme)
        updateSettings({ theme: newTheme })
    }

    // Sync theme from Supabase on load
    useEffect(() => {
        if (settings.theme && settings.theme !== theme) {
            setTheme(settings.theme)
        }
    }, [settings.theme, theme, setTheme])

    return (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-6 font-mono overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 border-b border-[var(--os-border)] pb-2">Appearance Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded border transition-all hover:scale-[1.02] active:scale-95 min-h-[60px] ${theme === t.id
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]"
                            : "border-[var(--os-border)] hover:bg-[var(--os-surface-hover)]"
                            }`}
                    >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-black ${t.color}`}>
                            {t.icon}
                        </div>
                        <span className="font-medium text-base sm:text-lg truncate">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-8 mb-6 border-b border-[var(--os-border)] pb-2 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold">System Customization</h2>
                <div className="text-xs text-[var(--muted-foreground)] border border-[var(--os-border)] px-2 py-1 rounded bg-[var(--os-surface)]">
                    Experimental
                </div>
            </div>

            <div className="space-y-8">
                {/* Font Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Typography</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'geist', label: 'Geist', font: 'var(--font-geist-sans)' },
                            { id: 'inter', label: 'Inter', font: 'var(--font-inter)' },
                            { id: 'roboto', label: 'Roboto', font: 'var(--font-roboto)' },
                            { id: 'lato', label: 'Lato', font: 'var(--font-lato)' },
                            { id: 'open-sans', label: 'Open Sans', font: 'var(--font-open-sans)' },
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => updateSettings({ font: f.id })}
                                className={`p-3 rounded border text-left transition-all hover:bg-[var(--os-surface-hover)] ${(settings.font || 'geist') === f.id
                                    ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)] text-[var(--foreground)]"
                                    : "border-[var(--os-border)] text-[var(--muted-foreground)]"
                                    }`}
                                style={{ fontFamily: f.font }}
                            >
                                <span className="text-sm font-medium">{f.label}</span>
                                <p className="text-xs opacity-70 mt-1">The quick brown fox</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icon Set Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Iconography</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'lucide', label: 'Lucide Icons', desc: 'Clean, consistent, modern.' },
                            { id: 'material', label: 'Material Design', desc: 'Google\'s signature style.' },
                        ].map((i) => (
                            <button
                                key={i.id}
                                onClick={() => updateSettings({ iconSet: i.id as any })}
                                className={`p-4 rounded border text-left transition-all hover:bg-[var(--os-surface-hover)] ${(settings.iconSet || 'lucide') === i.id
                                    ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                                    : "border-[var(--os-border)]"
                                    }`}
                            >
                                <span className="block font-bold mb-1">{i.label}</span>
                                <span className="text-xs text-[var(--muted-foreground)]">{i.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-3 sm:p-4 bg-[var(--os-surface)] rounded text-xs sm:text-sm text-[var(--muted-foreground)]">
                <p>Selected Theme: <span className="text-[var(--primary)] font-bold uppercase">{theme}</span></p>
                <p className="mt-2">Themes affect window highlights, terminal text, and accents.</p>
                <p className="mt-2 text-[var(--primary)]">Synced with Cloud Personalization (Supabase)</p>
            </div>
        </div>
    )
}
