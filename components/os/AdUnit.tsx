"use client"

import React, { useEffect } from "react"
import { useWindowManager } from "@/components/os/WindowManager"

interface AdUnitProps {
    slot: string
    format?: "auto" | "fluid" | "rectangle"
    layout?: string
    style?: React.CSSProperties
    className?: string
}

export function AdUnit({ slot, format = "auto", layout, style, className }: AdUnitProps) {
    const { isLoggedIn, isBooting } = useWindowManager()

    useEffect(() => {
        if (isLoggedIn && !isBooting) {
            try {
                // @ts-ignore
                ; (window.adsbygoogle = window.adsbygoogle || []).push({})
            } catch (err) {
                console.error("AdSense error:", err)
            }
        }
    }, [isLoggedIn, isBooting])

    if (!isLoggedIn || isBooting) {
        return null
    }

    return (
        <div className={`ad-container overflow-hidden rounded-xl border border-white/5 bg-black/20 ${className}`} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: "block", ...style }}
                data-ad-client="ca-pub-5565716152868775"
                data-ad-slot={slot}
                data-ad-format={format}
                {...(layout ? { "data-ad-layout": layout } : {})}
                data-full-width-responsive="true"
            />
        </div>
    )
}
