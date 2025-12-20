import React from "react"
import { Files, Library, Settings, Search, GitGraph, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"

interface IDEActivityBarProps {
    activeTab: "explorer" | "search" | "libraries" | "git" | "settings" | "boards"
    onTabChange: (tab: "explorer" | "search" | "libraries" | "git" | "settings" | "boards") => void
}

export function IDEActivityBar({ activeTab, onTabChange }: IDEActivityBarProps) {
    return (
        <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-center py-2 shrink-0 z-20">
            <ActivityBarItem
                icon={<Files size={24} />}
                isActive={activeTab === "explorer"}
                onClick={() => onTabChange("explorer")}
                label="Explorer"
            />
            <ActivityBarItem
                icon={<Search size={24} />}
                isActive={activeTab === "search"}
                onClick={() => onTabChange("search")}
                label="Search"
            />
            <ActivityBarItem
                icon={<GitGraph size={24} />}
                isActive={activeTab === "git"}
                onClick={() => onTabChange("git")}
                label="Source Control"
            />
            <ActivityBarItem
                icon={<Cpu size={24} />}
                isActive={activeTab === "boards"}
                onClick={() => onTabChange("boards")}
                label="Board Manager"
            />
            <ActivityBarItem
                icon={<Library size={24} />}
                isActive={activeTab === "libraries"}
                onClick={() => onTabChange("libraries")}
                label="Extensions"
            />
            <div className="flex-1" />
            <ActivityBarItem
                icon={<Settings size={24} />}
                isActive={activeTab === "settings"}
                onClick={() => onTabChange("settings")}
                label="Settings"
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
                "p-3 w-full flex justify-center relative transition-colors opacity-60 hover:opacity-100",
                isActive && "opacity-100 border-l-2 border-[var(--primary)]"
            )}
        >
            {icon}
        </button>
    )
}
