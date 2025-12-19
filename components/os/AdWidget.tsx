"use client"

import React, { useState, useEffect } from "react"
import { X, ExternalLink, Info } from "lucide-react"

export function AdWidget() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const closed = localStorage.getItem("ad_widget_closed")
        if (closed === "true") {
            setIsVisible(false)
        }
    }, [])

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering any parent click events
        setIsVisible(false)
        localStorage.setItem("ad_widget_closed", "true")
    }

    if (!isVisible) return null

    return (
        <div
            className="w-full md:absolute md:top-[340px] md:right-10 md:w-80 font-mono text-xs z-0 select-none text-primary/80 border border-primary/20 bg-black/40 p-4 rounded-lg transition-all hover:bg-black/60 group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-primary/30 uppercase font-bold text-primary">
                <div className="flex items-center gap-2">
                    <Info size={12} /> Sponsored Content
                </div>
                <button
                    onClick={handleClose}
                    className="hover:text-red-500 transition-colors cursor-pointer p-0.5"
                    title="Close Ads"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Ad Container */}
            <div className="min-h-[100px] flex flex-col items-center justify-center bg-black/20 rounded border border-primary/10 p-2 relative">
                {/* 
                    Placeholder for actual Ad script. 
                    Integration example for Google AdSense:
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                */}
                <div className="text-center space-y-2 py-4">
                    <p className="text-[10px] text-muted-foreground opacity-60">ADVERTISEMENT</p>
                    <div className="h-16 w-full flex items-center justify-center text-primary/40 italic">
                        [ Ad Placeholder ]
                    </div>
                    <button className="flex items-center gap-1 mx-auto text-[9px] border border-primary/30 px-2 py-1 rounded hover:bg-primary/10 transition-colors uppercase tracking-widest">
                        Learn More <ExternalLink size={10} />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-2 text-[8px] text-muted-foreground/60 flex justify-between items-center italic">
                <span>Free Tier Support</span>
                <span>v1.0.4-stable</span>
            </div>
        </div>
    )
}
