"use client"

import React, { useState, useEffect } from "react"
import SnowFall, { SnowfallProps } from 'react-snowfall'
import { useWindowManager } from "@/components/os/WindowManager"

export function SnowfallEffect(props: SnowfallProps) {
    const { showSnowfall } = useWindowManager()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Only render on client side to prevent hydration mismatch
    // The canvas element has different inline styles on server vs client
    if (!isMounted || !showSnowfall) return null
    return <SnowFall {...props} />
}
