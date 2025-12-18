"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BootSequence } from "@/components/os/BootSequence"
import { Taskbar } from "@/components/os/Taskbar"
import { WindowFrame } from "@/components/os/WindowFrame"
import { DesktopIcon } from "./DesktopIcon"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Settings, MessageCircle, Sparkles } from "lucide-react"

import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { CreditsApp } from "@/components/apps/CreditsApp"
import { ConkyWidget } from "@/components/os/ConkyWidget"
import { SettingsApp } from "@/components/apps/SettingsApp"
import dynamic from "next/dynamic"

const ResumeApp = dynamic(() => import("@/components/apps/ResumeApp").then(mod => mod.ResumeApp), { ssr: false })

import { LoginScreen } from "@/components/os/LoginScreen"
import { SnowfallEffect } from "@/components/ui/snowfall-effect"

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
            id: "credits",
            label: "Credits",
            icon: <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-yellow-400 border border-zinc-700 shadow-lg">
                <Sparkles size={20} />
            </div>,
            content: <CreditsApp />,
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
        {
            id: "whatsapp",
            label: "WhatsApp",
            icon: <MessageCircle className="text-green-500" size={32} />,
            action: () => window.open("https://wa.me/91882292607", "_blank"),
        },
    ]


    return (
        <div
            className="h-screen w-screen overflow-hidden bg-cover bg-center text-white relative transition-[background-image] duration-500 ease-in-out"
            style={{ backgroundImage: "var(--desktop-bg)" }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

            {/* Conky Widget */}
            <ConkyWidget />

            {/* Snowfall Effect */}
            <SnowfallEffect />

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
