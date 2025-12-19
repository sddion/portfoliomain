"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BootSequence } from "@/components/os/BootSequence"
import { Taskbar } from "@/components/os/Taskbar"
import { WindowFrame } from "@/components/os/WindowFrame"
import { DesktopIcon } from "./DesktopIcon"
import { Terminal, Folder, User, FileText, Github, Briefcase, Gitlab, Instagram, Settings, MessageCircle, Palette, CircuitBoard, Activity, Cpu, Radio } from "lucide-react"

import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"
import { ExperienceApp } from "@/components/apps/ExperienceApp"
import { ConkyWidget } from "@/components/os/ConkyWidget"
import { SettingsApp } from "@/components/apps/SettingsApp"
import { ESP32FlasherApp } from "@/components/apps/ESP32FlasherApp"
import { BlogApp } from "@/components/apps/BlogApp"
import { ResourceMonitorApp } from "@/components/apps/ResourceMonitorApp"
import { IoTControlApp } from "@/components/apps/IoTControlApp"
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
            id: "esp32-flasher",
            label: "ESP Flasher",
            icon: <CircuitBoard className="text-orange-500" size={32} />,
            content: <ESP32FlasherApp />,
        },
        {
            id: "blog",
            label: "Blog",
            icon: <FileText className="text-teal-400" size={32} />,
            content: <BlogApp />,
        },
        {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal size={32} className="text-[var(--primary)]" />,
            content: <TerminalApp />,
        },
        {
            id: "sys-monitor",
            label: "Sys Monitor",
            icon: <Activity className="text-emerald-500" size={32} />,
            content: <ResourceMonitorApp />,
        },
        {
            id: "iot-control",
            label: "IoT Control",
            icon: <Cpu className="text-blue-500" size={32} />,
            content: <IoTControlApp />,
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
            action: () => window.open("https://gitlab.com/0xd3ds3c", "_blank"),
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
            action: () => window.open("https://wa.me/918822972607", "_blank"),
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
                                if (icon.id === "esp32-flasher") {
                                    openWindow(icon.id, icon.label, icon.content, icon.icon, { width: "95vw", height: "90vh" })
                                } else {
                                    openWindow(icon.id, icon.label, icon.content, icon.icon)
                                }
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
