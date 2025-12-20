import React from "react"
import { Check, X, Bell, LayoutPanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface IDEStatusBarProps {
    file: string | undefined
    line: number
    col: number
    status: "idle" | "building" | "success" | "error"
    board: string
}

export function IDEStatusBar({ file, line, col, status, board }: IDEStatusBarProps) {
    return (
        <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none shrink-0 z-50">
            <div className="flex items-center gap-4">
                <button className="hover:bg-white/20 px-1 rounded flex items-center gap-1">
                    <LayoutPanelLeft size={12} />
                    <span>master*</span>
                </button>

                <div className="flex items-center gap-1">
                    {status === "idle" && <Check size={12} />}
                    {status === "building" && <span className="animate-pulse">Building...</span>}
                    {status === "success" && <span className="flex items-center gap-1"><Check size={12} /> Ready</span>}
                    {status === "error" && <span className="flex items-center gap-1 bg-red-600 px-1 rounded"><X size={12} /> Error</span>}
                </div>

                {status === "error" && (
                    <div className="flex items-center gap-1">
                        <X size={12} /> 1 Error
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span className="hover:bg-white/20 px-1 rounded cursor-pointer">
                    Ln {line}, Col {col}
                </span>
                <span className="hover:bg-white/20 px-1 rounded cursor-pointer">
                    UTF-8
                </span>
                <span className="hover:bg-white/20 px-1 rounded cursor-pointer">
                    {file?.endsWith(".cpp") || file?.endsWith(".ino") ? "C++" : "Plain Text"}
                </span>
                <span className="hover:bg-white/20 px-1 rounded cursor-pointer font-bold">
                    {board}
                </span>
                <Bell size={12} className="ml-1" />
            </div>
        </div>
    )
}
