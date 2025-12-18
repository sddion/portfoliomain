"use client"

import React from "react"
import SnowFall, { SnowfallProps } from 'react-snowfall'
import { useWindowManager } from "@/components/os/WindowManager"

export function SnowfallEffect(props: SnowfallProps) {
    const { showSnowfall } = useWindowManager()

    if (!showSnowfall) return null
    return <SnowFall {...props} />
}
