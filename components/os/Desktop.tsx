"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BootSequence } from "@/components/os/BootSequence"
import { Taskbar } from "@/components/os/Taskbar"
import { WindowFrame } from "@/components/os/WindowFrame"
import { DesktopIcon } from "./DesktopIcon"
import { Terminal, Folder, User, FileText, Github } from "lucide-react"

import { TerminalApp } from "@/components/apps/TerminalApp"
import { AboutApp } from "@/components/apps/AboutApp"
import { ProjectsApp } from "@/components/apps/ProjectsApp"

export function Desktop() {
    const { isBooting, setBooting, windows, openWindow } = useWindowManager()

    if (isBooting) {
        return <BootSequence onComplete={() => setBooting(false)} />
    }

    const icons = [
        {
            id: "terminal",
            label: "Terminal",
            icon: <Terminal className="text-green-500" size={32} />,
            content: <TerminalApp />,
        },
        {
            id: "about",
            label: "About Me",
            icon: <User className="text-blue-400" size={32} />,
            content: <AboutApp />,
        },
        {
            id: "projects",
            label: "Projects",
            icon: <Folder className="text-yellow-400" size={32} />,
            content: <ProjectsApp />,
        },
        {
            id: "resume",
            label: "Resume.pdf",
            icon: <FileText className="text-red-400" size={32} />,
            content: (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4 p-8 text-center">
                    <FileText size={48} className="text-zinc-700" />
                    <p>PDF Viewer Module Loading...</p>
                    <p className="text-xs">In a real deployment, embed the PDF here using &lt;iframe&gt; or react-pdf.</p>
                    <a href="/resume.pdf" target="_blank" className="text-blue-400 underline">Download Resume</a>
                </div>
            ),
        },
        {
            id: "github",
            label: "GitHub",
            icon: <Github className="text-white" size={32} />,
            action: () => window.open("https://github.com/sddion", "_blank"),
        },
    ]

    return (
        <div className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center text-white relative">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            {/* CRT Scanline Effect */}
            <div className="crt-effect pointer-events-none" />

            {/* Desktop Icons Grid */}
            <div className="relative z-0 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit h-[calc(100vh-40px)]">
                {icons.map((icon) => (
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
