import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { BrowserApp } from "@/components/apps/BrowserApp"
import { Globe } from "lucide-react"

export function AboutApp() {
    const { openWindow } = useWindowManager()
    return (
        <div className="p-6 font-mono text-[var(--foreground)]/80 space-y-6 max-w-3xl mx-auto selection:bg-[var(--primary)]/30">
            <div className="flex items-center gap-4 mb-6 border-b border-[var(--os-border)] pb-4">
                <img
                    src="https://avatars.githubusercontent.com/u/152778879?v=4"
                    alt="Sanju"
                    className="w-16 h-16 rounded-full border border-[var(--primary)]/50 object-cover shadow-lg"
                />
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Sanju</h1>
                    <p className="text-[var(--primary)]">Full-Stack Developer & Security Engineer</p>
                </div>
            </div>

            <div className="space-y-4 leading-relaxed">
                <p>
                    I&apos;m a <span className="text-[var(--foreground)] font-medium">self-taught full-stack developer</span> from
                    India with a passion for building things that work. My journey started with hands-on learning and has
                    evolved into deploying live applications used by real users.
                </p>

                <p>
                    My expertise spans multiple domains: <span className="text-[var(--primary)]">web development</span> (frontend and
                    backend), <span className="text-[var(--primary)]">mobile app development</span> with React Native,{" "}
                    <span className="text-[var(--primary)]">embedded hardware</span> projects with Arduino and ESP8266, and{" "}
                    <span className="text-[var(--primary)]">Windows automation</span> and security scripting.
                </p>

                <blockquote className="border-l-2 border-[var(--primary)] pl-4 py-2 my-4 bg-[var(--os-surface-hover)] italic text-[var(--muted-foreground)]">
                    &quot;Fullstack dev, automation junkie, CLI wizard, professional code wrangler.
                    If it can be automated, I&apos;ll automate it. If it can&apos;t, I&apos;ll still try.&quot;
                </blockquote>

                <p>
                    I write code, break code, fix code, and sometimes make code dance to music. Fluent in Bash, PowerShell,
                    JavaScript, TypeScript, Python, and sarcasm. I build web apps, CLI tools, PowerShell scripts, music
                    players, secure comms, e-commerce—and memes. My projects range from the useful, to the quirky, to the
                    “what the heck is this?”
                </p>

                <div className="bg-[var(--os-surface)] p-4 rounded border border-[var(--os-border)]">
                    <h3 className="text-[var(--foreground)] font-bold mb-2">Current Focus</h3>
                    <p className="text-sm">
                        Building full-stack applications with TypeScript, exploring new technologies, and contributing to open-source projects.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 py-2">
                    <img src="https://img.shields.io/github/followers/sddion?style=social" alt="Github Followers" />
                    <img src="https://img.shields.io/github/stars/sddion?style=social" alt="Github Stars" />
                    <img
                        src="https://img.shields.io/github/languages/top/sddion/portfoliomain?color=green"
                        alt="Top Language"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={() => {
                            openWindow("browser", "Browser", <BrowserApp />, <Globe size={18} />)
                            window.dispatchEvent(new CustomEvent("browser:open-url", { detail: { url: "https://github.com/sddion" } }))
                        }}
                        className="text-[var(--primary)] hover:underline opacity-80 hover:opacity-100 font-bold"
                    >
                        GitHub
                    </button>
                    <button
                        onClick={() => {
                            openWindow("browser", "Browser", <BrowserApp />, <Globe size={18} />)
                            window.dispatchEvent(new CustomEvent("browser:open-url", { detail: { url: "https://gitlab.com/0xd3ds3c" } }))
                        }}
                        className="text-[var(--primary)] hover:underline opacity-80 hover:opacity-100 font-bold"
                    >
                        GitLab
                    </button>
                </div>
            </div>
        </div>
    )
}
