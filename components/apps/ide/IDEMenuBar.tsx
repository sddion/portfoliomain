import React, { useState, useRef, useEffect } from "react"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface IDEMenuBarProps {
    onNewFile: () => void
    onSave: () => void
    onFormat: () => void
    onBuild: () => void
    onFlash: () => void
    onOpenSettings: () => void
    boardName: string
    boards: string[]
    onBoardChange: (board: string) => void
}

interface MenuItem {
    label: string
    shortcut?: string
    onClick?: () => void
    divider?: boolean
    disabled?: boolean
}

interface MenuGroup {
    label: string
    items: MenuItem[]
}

export function IDEMenuBar({
    onNewFile,
    onSave,
    onFormat,
    onBuild,
    onFlash,
    onOpenSettings,
    boardName,
    boards,
    onBoardChange
}: IDEMenuBarProps) {
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenu(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const menus: MenuGroup[] = [
        {
            label: "File",
            items: [
                { label: "New File", shortcut: "Ctrl+N", onClick: onNewFile },
                { label: "Save", shortcut: "Ctrl+S", onClick: onSave },
                { divider: true, label: "" },
                { label: "Close Editor", shortcut: "Ctrl+W" },
            ]
        },
        {
            label: "Edit",
            items: [
                { label: "Undo", shortcut: "Ctrl+Z" },
                { label: "Redo", shortcut: "Ctrl+Y" },
                { divider: true, label: "" },
                { label: "Format Document", shortcut: "Shift+Alt+F", onClick: onFormat },
            ]
        },
        {
            label: "Sketch",
            items: [
                { label: "Verify / Compile", shortcut: "Ctrl+R", onClick: onBuild },
                { label: "Upload", shortcut: "Ctrl+U", onClick: onFlash },
                { divider: true, label: "" },
                { label: "Include Library" },
            ]
        },
        {
            label: "Tools",
            items: [
                { label: `Board: ${boardName}`, disabled: true },
                ...boards.slice(0, 5).map(b => ({
                    label: `  ${b}`,
                    onClick: () => onBoardChange(b)
                })),
                { divider: true, label: "" },
                { label: "Settings", onClick: onOpenSettings },
            ]
        },
        {
            label: "Help",
            items: [
                { label: "Documentation" },
                { label: "Arduino Reference" },
                { divider: true, label: "" },
                { label: "About Code Studio" },
            ]
        }
    ]

    const handleMenuClick = (label: string) => {
        setOpenMenu(openMenu === label ? null : label)
    }

    const handleItemClick = (item: MenuItem) => {
        if (item.onClick && !item.disabled) {
            item.onClick()
        }
        setOpenMenu(null)
    }

    return (
        <div ref={menuRef} className="h-7 bg-[#3c3c3c] flex items-center px-2 text-[12px] text-white/80 shrink-0 border-b border-black/20 relative z-[200]">
            {menus.map(menu => (
                <div key={menu.label} className="relative">
                    <button
                        onClick={() => handleMenuClick(menu.label)}
                        onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
                        className={cn(
                            "px-2 py-1 hover:bg-white/10 rounded transition-colors",
                            openMenu === menu.label && "bg-white/10"
                        )}
                    >
                        {menu.label}
                    </button>

                    {openMenu === menu.label && (
                        <div className="absolute left-0 top-full mt-0.5 bg-[#252526] border border-white/10 rounded shadow-xl min-w-[200px] py-1 z-[300]">
                            {menu.items.map((item, i) => (
                                item.divider ? (
                                    <div key={i} className="h-px bg-white/10 my-1" />
                                ) : (
                                    <button
                                        key={i}
                                        onClick={() => handleItemClick(item)}
                                        disabled={item.disabled}
                                        className={cn(
                                            "w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#094771] transition-colors",
                                            item.disabled && "opacity-50 cursor-default hover:bg-transparent"
                                        )}
                                    >
                                        <span>{item.label}</span>
                                        {item.shortcut && (
                                            <span className="text-[10px] text-white/40 ml-4">{item.shortcut}</span>
                                        )}
                                    </button>
                                )
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Quick Settings Button on Right */}
            <div className="flex-1" />
            <button
                onClick={onOpenSettings}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Settings"
            >
                <Settings size={14} />
            </button>
        </div>
    )
}
