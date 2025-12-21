
import { IconName } from "@/components/os/IconManager"

export interface AppConfig {
    id: string
    title: string
    iconName: IconName
    iconColor?: string
    description: string
    longDescription?: string
    category: "Development" | "System" | "Social" | "Utility" | "Media" | "Productivity"
    isDefault: boolean
    featured?: boolean
    width?: string
    height?: string
    roles?: ('guest' | 'recruiter')[]
    preventUninstall?: boolean
    hideInStore?: boolean
    isNew?: boolean
}

export const APPS_METADATA: AppConfig[] = [
    {
        id: "app-store",
        title: "App Store",
        iconName: "package",
        iconColor: "text-blue-500",
        description: "Browse and install apps for sddionOS",
        longDescription: "The official app marketplace for sddionOS. Discover new tools, install updates, and manage your software ecosystem. Features a secure, curated collection of applications designed to enhance your productivity.",
        category: "System",
        isDefault: true,
        width: "60vw",
        height: "80vh",
        preventUninstall: true,
        hideInStore: true
    },
    {
        id: "about",
        title: "About Me",
        iconName: "user",
        iconColor: "text-blue-400",
        description: "Learn more about Sanju, the developer behind this OS.",
        longDescription: "A comprehensive digital portfolio and biography. Explore my background, skills, and the journey that led to the creation of sddionOS. Connect with me on social platforms and view my professional timeline.",
        category: "Social",
        isDefault: true,
        preventUninstall: true
    },
    {
        id: "projects",
        title: "Projects",
        iconName: "folder",
        iconColor: "text-yellow-400",
        description: "Explore my portfolio of projects and experiments.",
        longDescription: "A showcase of my open-source contributions, side projects, and technical experiments. Browse through codebases, live demos, and technical documentation.",
        category: "Development",
        isDefault: true,
        roles: ['recruiter']
    },
    {
        id: "experience",
        title: "Experience",
        iconName: "briefcase",
        iconColor: "text-purple-400",
        description: "My professional journey and work history.",
        longDescription: "A detailed timeline of my professional career, including roles, responsibilities, and key achievements. View my growth across different companies and technology stacks.",
        category: "Social",
        isDefault: true,
        roles: ['recruiter']
    },
    {
        id: "resume",
        title: "Resume",
        iconName: "file-text",
        iconColor: "text-red-400",
        description: "View and download my professional resume.",
        longDescription: "Access my up-to-date CV in PDF format. Optimized for printing and sharing with recruiters.",
        category: "Productivity",
        isDefault: true,
        roles: ['recruiter']
    },
    {
        id: "blog",
        title: "Blog",
        iconName: "message-square-text",
        iconColor: "text-teal-400",
        description: "Thoughts, tutorials, and tech ramblings.",
        longDescription: "Read my latest articles on web development, operating system design, and embedded systems. Stay updated with my technical insights and devlogs.",
        category: "Social",
        isDefault: false
    },
    {
        id: "terminal",
        title: "Terminal",
        iconName: "terminal",
        iconColor: "text-green-400",
        description: "Access the system via command line interface.",
        longDescription: "A fully functional ZSH-like terminal emulator. execute system commands, run scripts, and interact with the OS kernel directly. Supports pipes, history, and custom aliases.",
        category: "System",
        isDefault: true
    },
    {
        id: "browser",
        title: "Browser",
        iconName: "globe",
        iconColor: "text-cyan-400",
        description: "Surf the web within the OS.",
        longDescription: "A secure, sandboxed web browser for navigating the internet. Supports tabs, bookmarks, and basic privacy features.",
        category: "Utility",
        isDefault: true
    },
    {
        id: "studio",
        title: "Code Studio",
        iconName: "code",
        iconColor: "text-orange-400",
        description: "A lightweight code editor for embedded development.",
        longDescription: "An advanced IDE customized for sddionOS. Features syntax highlighting, code completion, and direct integration with the ESP32 Flasher tool for hardware development.",
        category: "Development",
        isDefault: false,
        featured: true,
        isNew: true
    },
    {
        id: "esp32-flasher",
        title: "ESP Flasher",
        iconName: "circuit-board",
        iconColor: "text-orange-500",
        description: "Flash firmware directly to ESP32 devices via WebSerial.",
        longDescription: "A powerful utility for flashing binary firmware to ESP32 microcontrollers directly from the browser. Supports baud rate selection, partition table monitoring, and serial console log output.",
        category: "Development",
        isDefault: false,
        width: "95vw",
        height: "90vh",
        isNew: true
    },
    {
        id: "img2bytes",
        title: "Image to Bytes",
        iconName: "file-text",
        iconColor: "text-pink-400",
        description: "Convert images to C byte arrays for display drivers.",
        longDescription: "A developer tool for converting images into C header files (byte arrays) for use with OLED/TFT display drivers (SSD1306, ST7735). Supports various color formats and dithering algorithms.",
        category: "Utility",
        isDefault: false,
        isNew: true
    },
    {
        id: "iot-control",
        title: "IoT Control",
        iconName: "cpu",
        iconColor: "text-blue-500",
        description: "Control your connected IoT devices.",
        longDescription: "A centralized dashboard for managing smart home devices. toggles lights, monitors sensors, and configures automation rules via MQTT/HTTP.",
        category: "Utility",
        isDefault: false,
        roles: ['recruiter']
    },
    {
        id: "sys-monitor",
        title: "System Monitor",
        iconName: "activity",
        iconColor: "text-emerald-500",
        description: "Monitor system resources and active processes.",
        longDescription: "Real-time system telemetry. Track CPU usage, memory consumption, network activity, and active window processes. Essential for performance debugging.",
        category: "System",
        isDefault: true
    },
    {
        id: "settings",
        title: "Settings",
        iconName: "settings",
        iconColor: "text-zinc-400",
        description: "Configure system preferences and wallpaper.",
        longDescription: "Personalize your sddionOS experience. Change wallpapers, adjust theme colors, manage user profile, and configure system behavior.",
        category: "System",
        isDefault: true
    }
]
