"use client"

import { useEffect, useState } from "react"
import { useMounted } from "@/hooks/use-mounted"

interface SkillProgressProps {
    name: string
    progress: number
}

export function SkillProgress({ name, progress }: SkillProgressProps) {
    const mounted = useMounted()
    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (mounted) {
            // Add a small delay before starting the animation
            const timer = setTimeout(() => {
                setWidth(progress)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [mounted, progress])

    const currentWidth = width || 0
    const progressProps = {
        role: "progressbar" as const,
        title: `${name} skill level`,
        "aria-label": `${name} skill level`,
        "aria-valuenow": currentWidth,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "data-progress": currentWidth,
    }

    return (
        <div className="mb-6">
            <div className="mb-1 flex justify-between">
                <span className="text-base font-medium text-black dark:text-white">
                    {name}
                </span>
                <span className="text-sm font-medium text-black dark:text-white">
                    {progress}%
                </span>
            </div>
            <div className="w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                    className="h-2.5 rounded-full bg-green-400 dark:bg-green-500 transition-[width] duration-1000 ease-in-out shadow-[0_0_10px_rgba(34,197,94,0.3)] dark:shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    style={{ width: `${currentWidth}%` }}
                    {...progressProps}
                />
            </div>
        </div>
    )
}