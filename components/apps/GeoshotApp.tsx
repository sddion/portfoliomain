"use client"

import React from "react"
import { Globe, ArrowUpRight } from "lucide-react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BrowserApp } from "@/components/apps/BrowserApp"

export function GeoshotApp() {
    const { openWindow } = useWindowManager()

    const openLink = (url: string) => {
        openWindow("browser", "Browser", <BrowserApp initialUrl={url} />, <Globe size={18} />)
        window.dispatchEvent(new CustomEvent("browser:open-url", { detail: { url } }))
    }

    return (
        <div className="h-full bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-[var(--os-border)]">
                        <img
                            src="https://raw.githubusercontent.com/sddion/geoshot/main/docs/assets/android-icon-48x48.png"
                            alt="Geoshot Icon"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">GeoShot</h1>
                        <p className="text-[var(--muted-foreground)] font-medium leading-relaxed">
                            Advanced geolocation camera application for field documentation and data-rich photography.
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => openLink("https://sddion.github.io/geoshot/")}
                        className="flex items-center justify-center gap-2 w-full bg-[var(--os-surface-hover)] border border-[var(--os-border)] hover:border-[var(--primary)]/50 text-[var(--foreground)] px-6 py-4 rounded-xl font-bold transition-all active:scale-95 group"
                    >
                        Learn More <ArrowUpRight size={18} className="text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                    <p className="mt-4 text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em] font-bold">
                        Official Project Page • sddion.github.io
                    </p>
                </div>
            </div>
        </div>
    )
}
