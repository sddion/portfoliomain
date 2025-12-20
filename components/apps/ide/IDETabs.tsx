import React, { useRef, useEffect } from "react"
import { X, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { IDEFile } from "./types"

interface IDETabsProps {
    files: IDEFile[]
    activeFileId: string | null
    onTabClick: (id: string) => void
    onTabClose: (id: string) => void
}

export function IDETabs({ files, activeFileId, onTabClick, onTabClose }: IDETabsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const openFiles = files.filter(f => f.isOpen)

    useEffect(() => {
        if (activeFileId && scrollContainerRef.current) {
            const activeTab = scrollContainerRef.current.querySelector(`[data-tab-id="${activeFileId}"]`)
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
            }
        }
    }, [activeFileId])

    return (
        <div
            ref={scrollContainerRef}
            className="flex bg-[#252526] h-[35px] overflow-x-auto scrollbar-hide border-b border-[#1e1e1e] flex-nowrap"
        >
            {openFiles.map(file => (
                <div
                    key={file.id}
                    data-tab-id={file.id}
                    onClick={() => onTabClick(file.id)}
                    className={cn(
                        "group flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer select-none text-xs shrink-0 relative pr-7",
                        activeFileId === file.id
                            ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]"
                            : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]"
                    )}
                >
                    <FileCode size={14} className={cn(
                        activeFileId === file.id ? "text-blue-400" : "text-[#969696]"
                    )} />
                    <span className="truncate">{file.name}{file.isModified && " ●"}</span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onTabClose(file.id)
                        }}
                        className={cn(
                            "absolute right-1 p-0.5 rounded-md hover:bg-white/20 transition-opacity",
                            activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}
