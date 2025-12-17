"use client"

import React from "react"
import { motion } from "framer-motion"
import { Briefcase, Calendar, MapPin, Circle } from "lucide-react"

interface ExperienceItem {
    id: string
    role: string
    company: string
    duration: string
    location?: string
    description: string[]
    type: "work" | "business" | "learning" | "builder"
}

const experiences: ExperienceItem[] = [
    {
        id: "builder",
        role: "System Building & Coding",
        company: "Builder Phase",
        duration: "Current",
        type: "builder",
        description: [
            "Returned full-focus to coding and system building",
            "Actively developing Portfolio OS & Bagley (AI/IoT)",
            "Executing > Credentials mindset",
        ]
    },
    {
        id: "zomato",
        role: "Delivery Ops",
        company: "Zomato",
        duration: "Post-Zepto → July 2025",
        type: "work",
        description: [
            "Continued operations experience",
            "Reinforced real-world execution mindset",
        ]
    },
    {
        id: "zepto",
        role: "Quick Commerce Ops",
        company: "Zepto",
        duration: "Jan 2025  (Bangalore)",
        type: "work",
        description: [
            "Exposure to quick-commerce operations",
            "Learned speed-driven workflows",
            "Hyper-local delivery systems",
            "Left due to compensation constraints",
        ]
    },
    {
        id: "learning",
        role: "Self-Taught Programmer",
        company: "Independent Learning",
        duration: "2022 onwards",
        type: "learning",
        description: [
            "HTML/CSS via FreeCodeCamp",
            "JS via Codecademy, Python via Practical Use",
            "Built Games, Calculators, Tracking Systems",
            "Strong fundamentals through practice, not theory",
        ]
    },
    {
        id: "business",
        role: "Founder",
        company: "Apparel & Merchandise Business",
        duration: "2017 → 2018",
        type: "business",
        description: [
            "Founded 1-year business selling custom prints",
            "Owned printing hardware & production",
            "Sales via FB Marketplace, Instagram, Retail",
            "Hands-on: Sales, Marketing, Inventory",
        ]
    },
    {
        id: "swiggy",
        role: "Delivery & Ops",
        company: "Swiggy",
        duration: "June 2021 → Jan 2022",
        type: "work",
        description: [
            "Real-world ops under time pressure",
            "Learned logistics flow & ground-level systems",
            "Dealt with scale, routing, and deadlines",
        ]
    },
]

export function ExperienceApp() {
    return (
        <div className="h-full overflow-y-auto p-6 font-mono text-zinc-300 selection:bg-purple-500/30 custom-scrollbar">
            <div className="max-w-3xl mx-auto relative pl-8 border-l border-zinc-800 space-y-12">

                {experiences.map((exp, index) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                    >
                        {/* Timeline Node */}
                        <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-zinc-950 flex items-center justify-center
                            ${exp.type === 'builder' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                exp.type === 'business' ? 'bg-purple-500' :
                                    exp.type === 'learning' ? 'bg-blue-500' : 'bg-zinc-600'}
                        `}>
                            {exp.type === 'builder' && <div className="w-full h-full animate-ping rounded-full bg-green-500 opacity-20" />}
                        </div>

                        {/* Content Card */}
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-zinc-700 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div>
                                    <h3 className={`text-lg font-bold ${exp.type === 'builder' ? 'text-green-400' : 'text-white'
                                        }`}>
                                        {exp.role}
                                    </h3>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <Briefcase size={14} />
                                        <span>{exp.company}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold px-2 py-1 rounded bg-zinc-950/50 text-zinc-500 border border-zinc-800/50">
                                    <Calendar size={12} />
                                    <span>{exp.duration}</span>
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {exp.description.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                        <span className="mt-1.5 w-1 h-1 bg-zinc-600 rounded-full shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}

            </div>
        </div>
    )
}
