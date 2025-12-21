"use client"

import React from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import {
    Terminal, Folder, User, FileText, Code, Globe, Briefcase,
    CircuitBoard, Activity, Cpu, Settings, Package, MessageSquareText,
    Home, PenTool, Layers, Search, Star, Wifi, Bluetooth, Volume2, Sun,
    Battery, Info, Smartphone, Bell, Plus, Check, ChevronLeft, Monitor, Droplet, Ghost,
    ExternalLink, Download,
    LucideProps
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Terminal as TerminalMui,
    Folder as FolderMui,
    Person as PersonMui,
    Article as ArticleMui,
    Code as CodeMui,
    Public as PublicMui,
    Work as WorkMui,
    DeveloperBoard as DeveloperBoardMui,
    ShowChart as ShowChartMui,
    Memory as MemoryMui,
    Settings as SettingsMui,
    Inventory2 as Inventory2Mui,
    Chat as ChatMui,
    Home as HomeMui,
    Create as CreateMui,
    Layers as LayersMui,
    Search as SearchMui,
    Star as StarMui,
    Wifi as WifiMui,
    Bluetooth as BluetoothMui,
    VolumeUp as VolumeUpMui,
    WbSunny as WbSunnyMui,
    BatteryFull as BatteryFullMui,
    Info as InfoMui,
    Smartphone as SmartphoneMui,
    Notifications as NotificationsMui,
    Add as AddMui,
    Check as CheckMui,
    ChevronLeft as ChevronLeftMui,
    Monitor as MonitorMui,
    WaterDrop as WaterDropMui,
    OpenInNew as OpenInNewMui,
    Download as DownloadMui,
    Html as HtmlMui // Ghost replacement or similar? Ghost usually implies pure fun. AccessibilityNew? 
} from "@mui/icons-material"

// Ghost icon in MUI? Maybe "AutoFixHigh" or "Science"? 
// Let's use "BugReport" for Ghost (Dracula theme context)
import { BugReport as GhostMui } from "@mui/icons-material"

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
    const { settings } = useWindowManager()
    const isMaterial = settings?.iconSet === 'material'

    // Helper to return consistent props for both sets
    // Material icons usually take 'fontSize' or 'sx', but can accept className
    // Lucide icons take 'size'

    // Check specific specific colors in passed className if needed, 
    // but mostly we just render the component.

    if (isMaterial) {
        // Material UI Icons
        const MuiIcon = getMaterialIcon(iconName)
        // Convert Lucide 'size' prop to MUI fontSize style if present
        const style = props.size ? { fontSize: props.size, ...props.style } : props.style
        // FORCE fill-current to respect text colors
        return <MuiIcon className={cn("fill-current", className)} style={{ ...style, color: 'inherit' }} />
    }

    // Lucide Icons
    const LucideIcon = getLucideIcon(iconName)
    return <LucideIcon className={className} {...props} />
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

function getMaterialIcon(name: IconName) {
    switch (name) {
        case "terminal": return TerminalMui
        case "folder": return FolderMui
        case "user": return PersonMui
        case "file-text": return ArticleMui
        case "code": return CodeMui
        case "globe": return PublicMui
        case "briefcase": return WorkMui
        case "circuit-board": return DeveloperBoardMui
        case "activity": return ShowChartMui
        case "cpu": return MemoryMui
        case "settings": return SettingsMui
        case "package": return Inventory2Mui
        case "message-square-text": return ChatMui
        case "home": return HomeMui
        case "pen-tool": return CreateMui
        case "layers": return LayersMui
        case "search": return SearchMui
        case "star": return StarMui
        case "wifi": return WifiMui
        case "bluetooth": return BluetoothMui
        case "volume-2": return VolumeUpMui
        case "sun": return WbSunnyMui
        case "battery": return BatteryFullMui
        case "info": return InfoMui
        case "smartphone": return SmartphoneMui
        case "bell": return NotificationsMui
        case "plus": return AddMui
        case "check": return CheckMui
        case "chevron-left": return ChevronLeftMui
        case "monitor": return MonitorMui
        case "droplet": return WaterDropMui
        case "ghost": return GhostMui
        case "external-link": return OpenInNewMui
        case "download": return DownloadMui
        default: return Inventory2Mui
    }
}
