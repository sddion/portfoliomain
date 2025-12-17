"use client"

import React from "react"

export function AboutApp() {
    return (
        <div className="p-6 font-mono text-zinc-300 space-y-6 max-w-3xl mx-auto selection:bg-green-500/30">
            <div className="flex items-center gap-4 mb-6 border-b border-zinc-700 pb-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-green-500 border border-green-500/50">
                    USER
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Sanju</h1>
                    <p className="text-green-500">Full-Stack Developer & Security Engineer</p>
                </div>
            </div>

            <div className="space-y-4 leading-relaxed">
                <p>
                    I&apos;m a <span className="text-white font-medium">self-taught full-stack developer</span> from
                    India with a passion for building things that work. My journey started with hands-on learning and has
                    evolved into deploying live applications used by real users.
                </p>

                <p>
                    My expertise spans multiple domains: <span className="text-blue-400">web development</span> (frontend and
                    backend), <span className="text-blue-400">mobile app development</span> with React Native,{" "}
                    <span className="text-blue-400">embedded hardware</span> projects with Arduino and ESP8266, and{" "}
                    <span className="text-blue-400">Windows automation</span> and security scripting.
                </p>

                <blockquote className="border-l-2 border-green-500 pl-4 py-2 my-4 bg-zinc-900/50 italic text-zinc-400">
                    &quot;Fullstack dev, automation junkie, CLI wizard, professional code wrangler.
                    If it can be automated, I&apos;ll automate it. If it can&apos;t, I&apos;ll still try.&quot;
                </blockquote>

                <p>
                    I write code, break code, fix code, and sometimes make code dance to music. Fluent in Bash, PowerShell,
                    JavaScript, TypeScript, Python, and sarcasm. I build web apps, CLI tools, PowerShell scripts, music
                    players, secure comms, e-commerce—and memes. My projects range from the useful, to the quirky, to the
                    “what the heck is this?”
                </p>

                <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                    <h3 className="text-white font-bold mb-2">Current Focus</h3>
                    <p className="text-sm">
                        Building full-stack applications with TypeScript, exploring new technologies, and contributing to open-source projects.
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    <a href="https://github.com/sddion" target="_blank" className="text-green-500 hover:underline hover:text-green-400">GitHub</a>
                    <a href="https://gitlab.com/dedsec" target="_blank" className="text-green-500 hover:underline hover:text-green-400">GitLab</a>
                </div>
            </div>
        </div>
    )
}
