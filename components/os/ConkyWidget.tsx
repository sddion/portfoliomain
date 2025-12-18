"use client"

import React, { useEffect, useState } from "react"
import { Github, Code, Terminal, Quote } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GithubStats {
    public_repos: number
    followers: number
    following: number
}

interface LanguageStats {
    [key: string]: number
}

export function ConkyWidget() {
    const [stats, setStats] = useState<GithubStats | null>(null)
    const [time, setTime] = useState(new Date())
    const [logs, setLogs] = useState<string[]>([])
    const [languages, setLanguages] = useState<{ name: string; percent: number; color: string; textColor: string }[]>([])

    // Fake system logs
    useEffect(() => {
        const sysLogs = [
            "KERNEL: Initializing...",
            "DAEMON: sshd started",
            "NET: eth0 connected",
            "USER: authenticated as guest",
            "SYSTEM: CPU temp 48°C",
            "MEM: 16GB OK",
            "DISK: /dev/sda1 mounted",
            "CRON: job scheduled",
            "XSERVER: display :0 active",
            "AUDIO: pulse-audio running"
        ]

        const logTimer = setInterval(() => {
            const randomLog = sysLogs[Math.floor(Math.random() * sysLogs.length)]
            const timestamp = format(new Date(), "HH:mm:ss")
            setLogs(prev => [`[${timestamp}] ${randomLog}`, ...prev].slice(0, 2))
        }, 2000)

        return () => clearInterval(logTimer)
    }, [])

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)

        const fetchData = async () => {
            // Fetch GitHub stats
            try {
                const userRes = await fetch("https://api.github.com/users/sddion")
                const userData = await userRes.json()
                setStats({
                    public_repos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following
                })

                // Fetch Languages
                const repoRes = await fetch("https://api.github.com/users/sddion/repos?per_page=100")
                const repos = await repoRes.json()

                const langCounts: LanguageStats = {}
                let totalRepos = 0

                if (Array.isArray(repos)) {
                    repos.forEach((repo: any) => {
                        if (repo.language) {
                            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
                            totalRepos++
                        }
                    })
                }

                const colors = ["bg-blue-500", "bg-yellow-400", "bg-purple-500", "bg-red-500", "bg-green-500"]
                const textColors = ["text-blue-400", "text-yellow-400", "text-purple-400", "text-red-400", "text-green-400"]

                const topLangs = Object.entries(langCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([name, count], index) => ({
                        name,
                        percent: (count / totalRepos) * 100,
                        color: colors[index % colors.length],
                        textColor: textColors[index % textColors.length]
                    }))

                setLanguages(topLangs)
            } catch (err) {
                console.error("Failed to fetch github data", err)
            }
        }

        fetchData()

        return () => clearInterval(timer)
    }, [])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    title="Click to view system details"
                    className="absolute top-[30px] right-10 w-80 font-mono text-xs z-0 select-none text-primary/80 hidden md:block cursor-pointer hover:bg-black/20 p-4 rounded-lg transition-colors text-left"
                >
                    {/* System Info */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-primary/30 pb-1 mb-2 uppercase flex items-center gap-2 text-primary">
                            <Terminal size={12} /> System Status
                        </h3>
                        <div className="flex justify-between mb-1">
                            <span>UPTIME:</span>
                            <span className="text-foreground">{format(time, "HH:mm:ss")}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>OS:</span>
                            <span className="text-foreground">SanjuOS v2.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>KERNEL:</span>
                            <span className="text-foreground">Linux 6.8.0-kali</span>
                        </div>
                    </div>

                    {/* Quote */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-primary/30 pb-1 mb-2 uppercase flex items-center gap-2 text-primary">
                            <Quote size={12} /> MOTD
                        </h3>
                        <blockquote className="italic text-muted-foreground border-l-2 border-primary/50 pl-2">
                            "A jack of all trades is a master of none, but oftentimes better than a master of one."
                        </blockquote>
                    </div>

                    {/* Logs */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-primary/30 pb-1 mb-2 uppercase flex items-center gap-2 text-primary">
                            <Terminal size={12} /> System Logs
                        </h3>
                        <div className="flex flex-col gap-1 opacity-80">
                            {logs.map((log, i) => (
                                <span key={i} className={`truncate ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"}`} style={{ opacity: 1 - i * 0.15 }}>
                                    {log}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* GitHub Stats */}
                    <div className="mb-6">
                        <h3 className="font-bold border-b border-primary/30 pb-1 mb-2 uppercase flex items-center gap-2 text-primary">
                            <Github size={12} /> GitHub Telemetry
                        </h3>
                        {stats ? (
                            <>
                                <div className="flex justify-between mb-1">
                                    <span>REPOS:</span>
                                    <span className="text-foreground">{stats.public_repos}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span>FOLLOWERS:</span>
                                    <span className="text-foreground">{stats.followers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>FOLLOWING:</span>
                                    <span className="text-foreground">{stats.following}</span>
                                </div>
                            </>
                        ) : (
                            <span className="animate-pulse">Fetching stream...</span>
                        )}
                    </div>

                    {/* Languages */}
                    <div>
                        <h3 className="font-bold border-b border-primary/30 pb-1 mb-2 uppercase flex items-center gap-2 text-primary">
                            <Code size={12} /> Active Stack
                        </h3>
                        <div className="w-full bg-muted h-1.5 rounded-full mb-2 overflow-hidden flex">
                            {languages.map((lang) => (
                                <div key={lang.name} className={`h-full ${lang.color}`} style={{ width: `${lang.percent}%` }} />
                            ))}
                            {languages.length === 0 && <div className="h-full bg-primary/20 w-full animate-pulse" />}
                        </div>

                        {/* Legend List */}
                        <div className="flex flex-col gap-1">
                            {languages.map((lang) => (
                                <div key={lang.name} className="flex justify-between items-center text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${lang.color}`} />
                                        <span className="text-foreground/80">{lang.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{lang.percent.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="font-mono border-primary/20 bg-black/90 backdrop-blur-xl text-xs sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white uppercase tracking-widest border-b border-primary/20 pb-2">
                        <Terminal size={16} /> System Control Panel
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-4">
                        <div className="p-3 rounded bg-primary/5 border border-primary/10">
                            <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Terminal size={12} /> System</h4>
                            <div className="space-y-1 text-muted-foreground">
                                <div className="flex justify-between"><span>OS:</span> <span className="text-foreground">SanjuOS v2.0</span></div>
                                <div className="flex justify-between"><span>Kernel:</span> <span className="text-foreground">6.8.0-kali</span></div>
                                <div className="flex justify-between"><span>Uptime:</span> <span className="text-foreground">{format(time, "HH:mm:ss")}</span></div>
                                <div className="flex justify-between"><span>CPU:</span> <span className="text-foreground">3%</span></div>
                                <div className="flex justify-between"><span>MEM:</span> <span className="text-foreground">1.2GB / 16GB</span></div>
                            </div>
                        </div>

                        <div className="p-3 rounded bg-secondary/5 border border-white/5">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Github size={12} /> GitHub</h4>
                            {stats ? (
                                <div className="space-y-1 text-muted-foreground">
                                    <div className="flex justify-between"><span>Repos:</span> <span className="text-foreground">{stats.public_repos}</span></div>
                                    <div className="flex justify-between"><span>Followers:</span> <span className="text-foreground">{stats.followers}</span></div>
                                    <div className="flex justify-between"><span>Following:</span> <span className="text-foreground">{stats.following}</span></div>
                                </div>
                            ) : (
                                <div className="animate-pulse text-muted-foreground">Syncing...</div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 rounded bg-zinc-900/50 border border-white/5">
                            <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2"><Code size={12} /> Tech Stack</h4>
                            <div className="space-y-1">
                                {languages.map((lang) => (
                                    <div key={lang.name} className="flex justify-between items-center text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${lang.color}`} />
                                            <span className="text-foreground/80">{lang.name}</span>
                                        </div>
                                        <span className="text-muted-foreground">{lang.percent.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-3 rounded bg-primary/5 border border-primary/10">
                            <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Quote size={12} /> MOTD</h4>
                            <p className="italic text-muted-foreground leading-tight">
                                "A jack of all trades is a master of none, but oftentimes better than a master of one."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded bg-black border border-primary/20 h-32 overflow-hidden font-mono text-[10px]">
                    <div className="text-primary/70 mb-1 border-b border-primary/20 pb-1">root@sanju-os:~$ tail -f /var/log/syslog</div>
                    <div className="flex flex-col gap-0.5 opacity-80">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-zinc-500">{log.split(' ')[0]}</span>
                                <span className={i === 0 ? "text-green-400" : "text-zinc-400"}>{log.substring(log.indexOf(' ') + 1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
