
import React from "react"
import dynamic from "next/dynamic"
import { APPS_METADATA, AppConfig } from "./apps-config"

// Re-export AppConfig so WindowManager and others can use it
export type { AppConfig }

// Import App Components
import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { SettingsApp } from "@/components/apps/SettingsApp"
import { ESP32FlasherApp } from "@/components/apps/ESP32FlasherApp"
import { TaskMonitor } from "@/components/apps/TaskMonitor"
import { IoTControlApp } from "@/components/apps/IoTControlApp"
import { Img2BytesApp } from "@/components/apps/Img2BytesApp"
import { BrowserApp } from "@/components/apps/BrowserApp"
import { IDEApp } from "@/components/apps/IDEApp"
import { BlogApp } from "@/components/apps/BlogApp"

// Dynamic Imports
const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })
const AppStoreApp = dynamic(() => import("@/components/apps/AppStoreApp").then(mod => mod.AppStoreApp), { ssr: false })

export type AppWithComponent = AppConfig & {
    component: React.ReactNode
}

const COMPONENT_MAP: Record<string, React.ReactNode> = {
    "app-store": <AppStoreApp />,
    "about": <AboutApp />,
    "projects": <ProjectsApp />,
    "experience": <ExperienceApp />,
    "resume": <ResumeApp />,
    "blog": <BlogApp />,
    "terminal": <TerminalApp />,
    "browser": <BrowserApp />,
    "studio": <IDEApp />,
    "esp32-flasher": <ESP32FlasherApp />,
    "img2bytes": <Img2BytesApp />,
    "iot-control": <IoTControlApp />,
    "sys-monitor": <TaskMonitor />,
    "settings": <SettingsApp />
}

export const INITIAL_APPS: AppWithComponent[] = APPS_METADATA.map(app => ({
    ...app,
    component: COMPONENT_MAP[app.id] || <div>App not found</div>
}))
