"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { User, Lock, ArrowRight } from "lucide-react"

export function LoginScreen() {
    const { login } = useWindowManager()
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === "guest") {
            login()
        } else {
            setError(true)
            setTimeout(() => setError(false), 2000)
        }
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-green-500 font-mono relative overflow-hidden">
            {/* Background Animation (Subtle) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-zinc-950 to-zinc-950" />
            <div className="crt-effect pointer-events-none" />

            <div className="z-10 flex flex-col items-center gap-8 w-full max-w-sm px-4">

                {/* User Avatar */}
                <div className="w-32 h-32 bg-zinc-900 rounded-full border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.2)] overflow-hidden relative">
                    <User size={80} className="text-zinc-400 absolute bottom-0 translate-y-2" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#00ff41]" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-widest text-white">ANONYMOUS</h1>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">SanjuOS Secure Login</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors">
                            <Lock size={16} />
                        </div>
                        <input
                            type="password"
                            placeholder="Password: guest"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900/80 border border-zinc-700 rounded px-10 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-white placeholder:text-zinc-600"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-800 hover:bg-green-600 hover:text-black rounded transition-colors text-zinc-400"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-bold animate-pulse">
                            ACCESS DENIED: INCORRECT PASSWORD
                        </div>
                    )}
                </form>

                <div className="absolute bottom-10 flex gap-8 text-zinc-600 text-xs uppercase tracking-wider">
                    <button className="hover:text-green-500 transition-colors">System Status</button>
                    <button className="hover:text-green-500 transition-colors">Reboot</button>
                    <button className="hover:text-green-500 transition-colors">Emergency</button>
                </div>
            </div>
        </div>
    )
}
