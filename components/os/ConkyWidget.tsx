"use client"

import React, { useEffect, useState } from "react"
import { Github, Code, Terminal, Clock, Quote } from "lucide-react"
import { format } from "date-fns"

interface GithubStats {
    public_repos: number
    followers: number
    following: number
}

export function ConkyWidget() {
    const [stats, setStats] = useState<GithubStats | null>(null)
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)

        // Fetch GitHub stats
        fetch("https://api.github.com/users/sddion")
            .then(res => res.json())
            .then(data => {
                setStats({
                    public_repos: data.public_repos,
                    followers: data.followers,
                    following: data.following
                })
            })
            .catch(err => console.error("Failed to fetch github stats", err))

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="absolute top-10 right-10 w-80 font-mono text-xs z-0 pointer-events-none select-none text-green-500/80 hidden md:block">
            {/* System Info */}
            <div className="mb-6">
                <h3 className="font-bold border-b border-green-500/30 pb-1 mb-2 uppercase flex items-center gap-2">
                    <Terminal size={12} /> System Status
                </h3>
                <div className="flex justify-between mb-1">
                    <span>UPTIME:</span>
                    <span className="text-white">{format(time, "HH:mm:ss")}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>OS:</span>
                    <span className="text-white">SanjuOS v2.0</span>
                </div>
                <div className="flex justify-between">
                    <span>KERNEL:</span>
                    <span className="text-white">Linux 6.8.0-kali</span>
                </div>
            </div>

            {/* Quote */}
            <div className="mb-6">
                <h3 className="font-bold border-b border-green-500/30 pb-1 mb-2 uppercase flex items-center gap-2">
                    <Quote size={12} /> MOTD
                </h3>
                <blockquote className="italic text-zinc-400 border-l-2 border-green-500/50 pl-2">
                    "A jack of all trades is a master of none, but oftentimes better than a master of one."
                </blockquote>
            </div>

            {/* GitHub Stats */}
            <div className="mb-6">
                <h3 className="font-bold border-b border-green-500/30 pb-1 mb-2 uppercase flex items-center gap-2">
                    <Github size={12} /> GitHub Telemetry
                </h3>
                {stats ? (
                    <>
                        <div className="flex justify-between mb-1">
                            <span>REPOS:</span>
                            <span className="text-white">{stats.public_repos}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>FOLLOWERS:</span>
                            <span className="text-white">{stats.followers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>FOLLOWING:</span>
                            <span className="text-white">{stats.following}</span>
                        </div>
                    </>
                ) : (
                    <span className="animate-pulse">Fetching stream...</span>
                )}
            </div>

            {/* Languages */}
            <div>
                <h3 className="font-bold border-b border-green-500/30 pb-1 mb-2 uppercase flex items-center gap-2">
                    <Code size={12} /> Active Stack
                </h3>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full mb-1 overflow-hidden flex">
                    <div className="h-full bg-blue-500 w-[45%]" />
                    <div className="h-full bg-yellow-400 w-[30%]" />
                    <div className="h-full bg-purple-500 w-[25%]" />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                    <span className="text-blue-400">TypeScript</span>
                    <span className="text-yellow-400">Python</span>
                    <span className="text-purple-400">C#</span>
                </div>
            </div>
        </div>
    )
}
