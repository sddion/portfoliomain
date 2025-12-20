"use client"

import React from "react"
import { Printer, Mail, MapPin, Globe, Github, Briefcase, GraduationCap, Star, Code } from "lucide-react"

export function ResumeApp() {
    const handlePrint = () => {
        window.print()
    }

    const experience = [
        {
            company: "Zomato",
            role: "Delivery Operations",
            period: "Post-Zepto → July 2025",
            desc: "Managed high-pressure delivery operations, optimizing for real-time routing and field execution. Developed a deep understanding of hyper-local logistics and ground-level systems."
        },
        {
            company: "Zepto",
            role: "Quick Commerce Operations",
            period: "Jan 2025 (Bangalore)",
            desc: "Executed speed-driven workflows in a quick-commerce environment. Focused on logistics flow, local delivery systems, and operational efficiency under tight deadlines."
        },
        {
            company: "Independent / Builder Phase",
            role: "Full-Stack Developer & Systems Builder",
            period: "2022 - Present",
            desc: "Architected sddionOS (Portfolio), GeoShot (Geolocation Camera), and high-maturity IoT tools. Focused on bridging web and hardware using Web Serial API, real-time telemetry, and dithering algorithms for constrained devices."
        },
        {
            company: "Apparel & Merchandise Business",
            role: "Founder & Operator",
            period: "2017 - 2018",
            desc: "Built and managed a custom apparel printing business. Handled everything from hardware maintenance and production to marketing and sales via social platforms."
        },
        {
            company: "Swiggy",
            role: "Delivery & Operations",
            period: "June 2021 - Jan 2022",
            desc: "Gained foundational experience in logistics and ground-level operations, focusing on dead-line management and routing efficiency."
        }
    ]

    const skills = [
        { name: "React / Next.js / TypeScript / State Management", level: 95 },
        { name: "JavaScript / Node.js / System Architecture", level: 92 },
        { name: "Embedded Systems (C++ / ESP32 / Web Serial)", level: 90 },
        { name: "Operations / Logistics / Field Execution", level: 92 },
        { name: "UI/UX & Engineering Tooling", level: 88 }
    ]

    return (
        <div className="h-full flex flex-col bg-white text-zinc-900 overflow-auto selection:bg-blue-100 print:overflow-visible">
            {/* Toolbar - Hidden on Print */}
            <div className="h-14 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 print:hidden sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Recruiter Tool</span>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
                >
                    <Printer size={14} /> Print
                </button>
            </div>

            {/* Resume Content */}
            <div className="resume-paper flex-1 p-8 sm:p-12 md:p-16 max-w-[850px] mx-auto w-full bg-white print:p-0 print:max-w-full">
                {/* Header */}
                <header className="border-b-2 border-zinc-900 pb-8 mb-10 flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter mb-2">SAN JU</h1>
                        <p className="text-xl font-bold text-blue-600 uppercase tracking-widest">Full-Stack Developer & Ops Specialist</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-zinc-500">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-zinc-400" /> devopsanju@gmail.com</div>
                        <div className="flex items-center gap-2"><MapPin size={12} className="text-zinc-400" /> Bangalore, IN</div>
                        <div className="flex items-center gap-2"><Github size={12} className="text-zinc-400" /> github.com/sddion</div>
                        <div className="flex items-center gap-2"><Globe size={12} className="text-zinc-400" /> sddion.vercel.app</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Column */}
                    <div className="md:col-span-2 space-y-12">
                        {/* Profile Section */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <Star size={14} /> Professional Profile
                            </h2>
                            <p className="text-zinc-700 leading-relaxed font-medium">
                                A high-execution developer with a background in field operations and logistics.
                                Transitioned from real-world systems management to digital architecture,
                                building high-performance web applications and embedded IoT tools.
                                Focused on the "Builder Mindset" where execution trumps credentials.
                            </p>
                        </section>

                        {/* Experience Section */}
                        <section className="space-y-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <Briefcase size={14} /> Experience
                            </h2>
                            <div className="space-y-10">
                                {experience.map((exp, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-xl font-black">{exp.company}</h3>
                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 ml-4">{exp.period}</span>
                                        </div>
                                        <p className="text-sm font-bold text-zinc-500 mb-3 italic">{exp.role}</p>
                                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">{exp.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-12">
                        {/* Skills */}
                        <section className="space-y-6">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <Code size={14} /> Core Tech
                            </h2>
                            <div className="space-y-6 text-zinc-800">
                                {skills.map(skill => (
                                    <div key={skill.name} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            <span>{skill.name}</span>
                                            <span>{skill.level}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${skill.level}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
                                <GraduationCap size={14} /> Evolution
                            </h2>
                            <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                                <h4 className="font-black text-zinc-900 text-sm">Systems Builder Path</h4>
                                <p className="text-xs text-zinc-500 font-bold leading-relaxed uppercase tracking-tight">
                                    Intensive independent study in Computer Science and Embedded systems. 10,000+ hours in code. Specialized in firmware architecture and hardware-web bridging.
                                </p>
                            </div>
                        </section>


                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-20 pt-8 border-t border-zinc-100 transition-opacity">
                    <p className="text-[10px] text-zinc-400 font-black text-center uppercase tracking-widest leading-loose">
                        Generated by sddionOS • Integrated System v2.0
                    </p>
                </footer>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        background: white;
                        color: black;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}
