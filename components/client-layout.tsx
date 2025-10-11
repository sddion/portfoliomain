"use client"

import { ThemeProvider } from "@/components/theme-provider"
import type { PropsWithChildren } from "react"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

export function ClientLayout({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <Suspense fallback={null}>
                {children}
                <Analytics />
            </Suspense>
        </ThemeProvider>
    )
}