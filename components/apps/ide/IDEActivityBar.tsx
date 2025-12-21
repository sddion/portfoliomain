import React from "react"
import { Files, Library, GitBranch, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface IDEActivityBarProps {
    activeTab: "explorer" | "libraries" | "git" | "settings" | "boards" | "tools"
    onTabChange: (tab: "explorer" | "libraries" | "git" | "settings" | "boards" | "tools") => void
}

export function IDEActivityBar({ activeTab, onTabChange }: IDEActivityBarProps) {
    return (
        <div className="w-12 bg-[var(--ide-bg,#1e1e1e)] border-r border-[var(--ide-border,#333)] flex flex-col items-center py-2 shrink-0 z-20">
            <ActivityBarItem
                icon={<Files size={22} />}
                isActive={activeTab === "explorer"}
                onClick={() => onTabChange("explorer")}
                label="Explorer"
            />
            <ActivityBarItem
                icon={<GitBranch size={22} />}
                isActive={activeTab === "git"}
                onClick={() => onTabChange("git")}
                label="Source Control"
            />
            <ActivityBarItem
                icon={<Cpu size={22} />}
                isActive={activeTab === "boards"}
                onClick={() => onTabChange("boards")}
                label="Board Manager"
            />
            <ActivityBarItem
                icon={<Library size={22} />}
                isActive={activeTab === "libraries"}
                onClick={() => onTabChange("libraries")}
                label="Library Manager"
            />
        </div>
    )
}

function ActivityBarItem({ icon, isActive, onClick, label }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "p-3 w-full flex justify-center relative transition-all duration-150",
                "text-[var(--ide-icon,#858585)] hover:text-[var(--ide-icon-hover,#cccccc)]",
                isActive && "text-[var(--ide-icon-active,#ffffff)] border-l-2 border-[var(--ide-accent,#007acc)]"
            )}
        >
            {icon}
        </button>
    )
}
