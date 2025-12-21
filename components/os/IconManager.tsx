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

interface AppIconProps extends LucideProps {
    iconName: IconName
    className?: string
}

export function AppIcon({ iconName, className, ...props }: AppIconProps) {
    const LucideIcon = getLucideIcon(iconName)
    return <LucideIcon className={cn("stroke-current", className)} {...props} />
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
