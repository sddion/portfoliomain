"use client"

import React from "react"
import {
    Terminal, Folder, User, FileText, Code, Globe, Briefcase,
    CircuitBoard, Activity, Cpu, Settings, Package, MessageSquareText,
    Home, PenTool, Layers, Search, Star, Wifi, Bluetooth, Volume2, Sun,
    Battery, Info, Smartphone, Bell, Plus, Check, ChevronLeft, Monitor, Droplet, Ghost,
    ExternalLink, Download,
    LucideProps
} from "lucide-react"
import { cn } from "@/lib/utils"

export type IconName =
    | "terminal" | "folder" | "user" | "file-text" | "code" | "globe"
    | "briefcase" | "circuit-board" | "activity" | "cpu" | "settings"
    | "package" | "message-square-text"
    | "home" | "pen-tool" | "layers" | "search" | "star"
    | "wifi" | "bluetooth" | "volume-2" | "sun" | "battery" | "info"
    | "smartphone" | "bell" | "plus" | "check" | "chevron-left"
    | "monitor" | "droplet" | "ghost" | "external-link" | "download"

// Custom PNG icons disabled - they have solid backgrounds that don't look good in the UI
// Using Lucide SVG icons instead (transparent by default)
// To re-enable, add entries like: "user": "/icons/about.png"
const CUSTOM_ICON_MAP: Partial<Record<IconName, string>> = {
    // Icons with transparent backgrounds can be added here
}

interface AppIconProps extends Omit<LucideProps, 'ref'> {
    iconName: IconName
    className?: string
    useCustomIcon?: boolean
}

export function AppIcon({ iconName, className, useCustomIcon = true, size = 24, ...props }: AppIconProps) {
    const customIconPath = CUSTOM_ICON_MAP[iconName]

    // Use custom PNG icon if available and enabled
    if (useCustomIcon && customIconPath) {
        const sizeNum = typeof size === 'number' ? size : parseInt(size, 10) || 24
        return (
            <img
                src={customIconPath}
                alt={iconName}
                width={sizeNum}
                height={sizeNum}
                className={cn("object-contain", className)}
                style={{ width: sizeNum, height: sizeNum }}
            />
        )
    }

    // Fallback to Lucide icon
    const LucideIcon = getLucideIcon(iconName)
    return <LucideIcon className={cn("stroke-current", className)} size={size} {...props} />
}

function getLucideIcon(name: IconName) {
    switch (name) {
        case "terminal": return Terminal
        case "folder": return Folder
        case "user": return User
        case "file-text": return FileText
        case "code": return Code
        case "globe": return Globe
        case "briefcase": return Briefcase
        case "circuit-board": return CircuitBoard
        case "activity": return Activity
        case "cpu": return Cpu
        case "settings": return Settings
        case "package": return Package
        case "message-square-text": return MessageSquareText
        case "home": return Home
        case "pen-tool": return PenTool
        case "layers": return Layers
        case "search": return Search
        case "star": return Star
        case "wifi": return Wifi
        case "bluetooth": return Bluetooth
        case "volume-2": return Volume2
        case "sun": return Sun
        case "battery": return Battery
        case "info": return Info
        case "smartphone": return Smartphone
        case "bell": return Bell
        case "plus": return Plus
        case "check": return Check
        case "chevron-left": return ChevronLeft
        case "monitor": return Monitor
        case "droplet": return Droplet
        case "ghost": return Ghost
        case "external-link": return ExternalLink
        case "download": return Download
        default: return Package
    }
}
