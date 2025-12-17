"use client"

import { Desktop } from "@/components/os/Desktop"
import { MobileDesktop } from "@/components/os/MobileDesktop"
import { WindowProvider } from "@/components/os/WindowManager"
import { useState, useEffect } from "react"

function ClientLayout() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!mounted) return null

  return (
    <WindowProvider>
      {isMobile ? <MobileDesktop /> : <Desktop />}
    </WindowProvider>
  )
}

export default function Home() {
  return <ClientLayout />
}
