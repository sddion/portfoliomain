export type Project = {
  id: string
  title: string
  description: string
  category: "web" | "mobile" | "embedded" | "security"
  techStack: string[]
  liveUrl?: string
  githubUrl?: string
  gitlabUrl?: string
  features: string[]
  disclaimer?: string
}

export const projects: Project[] = [
  // Web / Full-Stack Apps
  {
    id: "ragava",
    title: "Ragava (Next.js Music Player)",
    description:
      "A full-featured, production-ready music player with playlists and streaming. Built for reliability and clean client/server separation.",
    category: "web",
    techStack: ["Next.js", "TypeScript", "React", "Node.js"],
    liveUrl: "https://ragava.vercel.app",
    githubUrl: "https://github.com/sddion/Ragava",
    gitlabUrl: "https://gitlab.com/sju17051/wavemusic",
    features: ["Playlist Management", "Audio Streaming", "Responsive UI", "API route architecture", "CI/CD"],
  },
  {
    id: "animastore",
    title: "Animastore",
    description: "E-commerce style web application with product browsing and listing features",
    category: "web",
    techStack: ["React", "TypeScript", "Node.js"],
    liveUrl: "https://animastore.vercel.app",
    githubUrl: "https://github.com/sddion/animastore",
    features: ["Product Listing", "Browse Interface", "Responsive Layout", "Modern Design"],
  },
  {
    id: "voicelink",
    title: "Voicelink",
    description: "Encrypted voice-call web application with real-time communication and secure authentication",
    category: "web",
    techStack: ["Node.js", "Twilio", "JWT", "WebRTC"],
    liveUrl: "https://voicelink.onrender.com",
    githubUrl: "https://github.com/sddion/voicelink",
    features: ["JWT Authentication", "Real-time Voice Channels", "Secure Communication", "End-to-End Encryption"],
  },
  {
    id: "wave",
    title: "Wave (archived)",
    description:
      "Original Flask-based web music player (archived, read-only). The project has been redesigned and migrated to Express.js, then reimplemented with Next.js (Ragava).",
    category: "web",
    techStack: ["Python", "Flask", "JavaScript", "HTML/CSS"],
    githubUrl: "https://github.com/sddion/wave-music-player",
    features: ["Audio UI", "Flask Backend", "Custom Controls"],
    disclaimer:
      "Archived (read-only). Migration to Express.js: https://github.com/sddion/wave Next.js implementation: https://github.com/sddion/Ragava (Legacy code not maintained)",
  },
  // Mobile Apps
  {
    id: "oiipuwali",
    title: "oiipuwali",
    description: "Food delivery mobile app with restaurant discovery, ordering, and real-time tracking",
    category: "mobile",
    techStack: ["React Native", "Expo", "Redux Toolkit", "Supabase", "Firebase"],
    githubUrl: "https://github.com/sddion/oiipuwali",
    features: [
      "Nearby Restaurant Discovery",
      "Menu Browsing",
      "Shopping Cart",
      "Payment Integration",
      "Real-time Order Tracking",
      "Push Notifications",
    ],
  },
  // Embedded / Hardware
  {
    id: "parola",
    title: "Parola_",
    description: "ESP8266 WiFi-enabled LED matrix display with real-time clock updates and network integration",
    category: "embedded",
    techStack: ["C++", "Arduino", "ESP8266", "WiFi"],
    githubUrl: "https://github.com/sddion/Parola_",
    features: [
      "WiFi Connectivity",
      "Real-time Clock Display",
      "LED Matrix Control",
      "Constrained Memory Optimization",
      "Network Time Protocol",
    ],
  },
  // Security / Systems Scripting
  {
    id: "badboy",
    title: "Badboy",
    description: "Windows PowerShell script for system auditing and enumeration",
    category: "security",
    techStack: ["PowerShell", "Windows"],
    githubUrl: "https://github.com/sddion/badboy",
    features: [
      "Startup Inspection",
      "Network Information Gathering",
      "Browser Data Enumeration",
      "System Auditing Tools",
    ],
    disclaimer: "For educational and authorized use only. Always obtain proper authorization before use.",
  },
  {
    id: "unix2usb",
    title: "Unix2usb",
    description: "Shell script to build multi-boot USB drives from Linux/Unix systems",
    category: "security",
    techStack: ["Shell Script", "Linux", "Unix"],
    githubUrl: "https://github.com/sddion/unix2usb",
    features: ["Multi-boot USB Creation", "Linux/Unix Support", "Automated Setup", "Bootable Drive Management"],
  },
]

export const categories = [
  { id: "all", label: "All Projects" },
  { id: "web", label: "Web & Full-Stack" },
  { id: "mobile", label: "Mobile Apps" },
  { id: "embedded", label: "Embedded Systems" },
  { id: "security", label: "Security & Scripting" },
] as const
