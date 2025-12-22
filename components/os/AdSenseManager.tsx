"use client"

import { useEffect } from "react"
import { useWindowManager } from "@/components/os/WindowManager"

export function AdSenseManager() {
    const { isLoggedIn, isBooting, hasContentWindow } = useWindowManager()

    useEffect(() => {
        // Only load AdSense if the user is logged in AND the boot sequence is finished AND a content window is open.
        // This ensures ads are only served on screens with publisher content.
        if (!isLoggedIn || isBooting || !hasContentWindow) {
            return
        }

        const script = document.createElement("script")
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5565716152868775"
        script.async = true
        script.crossOrigin = "anonymous"
        document.head.appendChild(script)

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script)
            }
        }
    }, [isLoggedIn, isBooting, hasContentWindow])

    return null
}
