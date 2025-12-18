"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BootSequence } from "@/components/os/BootSequence"
import { Taskbar } from "@/components/os/Taskbar"
import { WindowFrame } from "@/components/os/WindowFrame"
import { DesktopIcon } from "./DesktopIcon"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Settings } from "lucide-react"

import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { ConkyWidget } from "@/components/os/ConkyWidget"
import { SettingsApp } from "@/components/apps/SettingsApp"
import dynamic from "next/dynamic"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

import { LoginScreen } from "@/components/os/LoginScreen"

export function Desktop() {
    const { isBooting, setBooting, windows, openWindow, isLoggedIn } = useWindowManager()

    if (!isLoggedIn) {
        return <LoginScreen />
    }

    if (isBooting) {
        return <BootSequence onComplete={() => setBooting(false)} />
    }

    const icons = [
        {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal className="text-primary" size={32} />,
            content: <TerminalApp />,
        },
        {
            id: "about",
            label: "About Me",
            icon: <User className="text-blue-400" size={32} />,
            content: <AboutApp />,
        },
        {
            id: "experience",
            label: "Experience",
            icon: <Briefcase className="text-purple-400" size={32} />,
            content: <ExperienceApp />,
        },
        {
            id: "projects",
            label: "Projects",
            icon: <Folder className="text-yellow-400" size={32} />,
            content: <ProjectsApp />,
        },
        {
            id: "resume",
            label: "Resume",
            icon: <FileText className="text-red-400" size={32} />,
            content: <ResumeApp />,
        },
        {
            id: "settings",
            label: "Settings",
            icon: <Settings className="text-zinc-400" size={32} />,
            content: <SettingsApp />,
        },
        {
            id: "github",
            label: "GitHub",
            icon: <Github className="text-white" size={32} />,
            action: () => window.open("https://github.com/sddion", "_blank"),
        },
        {
            id: "gitlab",
            label: "GitLab",
            icon: <Gitlab className="text-orange-500" size={32} />,
            action: () => window.open("https://gitlab.com/0xdeds3c", "_blank"),
        },
        {
            id: "instagram",
            label: "Instagram",
            icon: <Instagram className="text-pink-500" size={32} />,
            action: () => window.open("https://instagram.com/wordswires", "_blank"),
        },
    ]


    // Clean up duplicate icons by filtering unique IDs or just ensuring list is correct.
    // The previous update appended duplicates. I will re-declare the list cleanly.

    return (
        <div className="h-screen w-screen overflow-hidden bg-[url('/cyber-bg.jpg')] bg-cover bg-center text-white relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

            {/* Conky Widget */}
            <ConkyWidget />

            {/* CRT Scanline Effect */}
            <div className="crt-effect pointer-events-none" />

            {/* Desktop Icons Grid */}
            <div className="relative z-0 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit h-[calc(100vh-40px)]">
                {icons.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).map((icon) => (
                    <DesktopIcon
                        key={icon.id}
                        label={icon.label}
                        icon={icon.icon}
                        onDoubleClick={() => {
                            if (icon.action) {
                                icon.action()
                            } else {
                                openWindow(icon.id, icon.label, icon.content, icon.icon)
                            }
                        }}
                    />
                ))}
            </div>

            {/* Windows */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {windows.map((win) => (
                    <div key={win.id} className="pointer-events-auto">
                        <WindowFrame {...win}>{win.content}</WindowFrame>
                    </div>
                ))}
            </div>

            <Taskbar />
        </div>
    )
}
