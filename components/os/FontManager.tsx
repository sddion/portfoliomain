"use client"

import { useEffect } from "react"
import { useWindowManager } from "@/components/os/WindowManager"

export function FontManager() {
    const { settings } = useWindowManager()

    useEffect(() => {
        const root = document.documentElement

        // Map settings.font to actual CSS variables
        // Default to Geist if not specified
        const selectedFont = settings.font || "geist"

        let fontVariable = "var(--font-geist-sans)"

        switch (selectedFont) {
            case "geist":
                fontVariable = "var(--font-geist-sans)"
                break
            case "inter":
                fontVariable = "var(--font-inter)"
                break
            case "roboto":
                fontVariable = "var(--font-roboto)"
                break
            case "lato":
                fontVariable = "var(--font-lato)"
                break
            case "open-sans":
                fontVariable = "var(--font-open-sans)"
                break
            default:
                fontVariable = "var(--font-geist-sans)"
        }

        root.style.setProperty("--ui-font-sans", fontVariable)

    }, [settings.font])

    return null
}
