"use client"

import Script from "next/script"
import { useWindowManager } from "@/components/os/WindowManager"

export function AdSenseManager() {
    const { isLoggedIn, isBooting } = useWindowManager()

    // Only load AdSense if the user is logged in AND the boot sequence is finished.
    // This ensures ads are only served on the "Desktop" which contains publisher content.
    if (!isLoggedIn || isBooting) {
        return null
    }

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5565716152868775"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    )
}
