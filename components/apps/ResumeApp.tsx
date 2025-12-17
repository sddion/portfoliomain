"use client"

import React from "react"
import { Printer, Download, Mail, Github, Linkedin, MapPin, Phone } from "lucide-react"

export function ResumeApp() {
    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="h-full overflow-y-auto bg-zinc-800 p-8 flex flex-col items-center gap-4">

            {/* Controls */}
            <div className="flex gap-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded transition-colors"
                >
                    <Printer size={16} /> Print Resume
                </button>
            </div>

            {/* A4 Paper */}
            <div className="resume-paper w-[210mm] min-h-[297mm] bg-white text-zinc-900 shadow-2xl p-[15mm] font-sans text-sm leading-relaxed print:shadow-none print:w-full print:h-full print:p-0 print:m-0">

                {/* Header */}
                <header className="border-b-2 border-zinc-900 pb-6 mb-6">
                    <h1 className="text-4xl font-extrabold uppercase tracking-tight text-zinc-900 mb-2">Sanju</h1>
                    <p className="text-lg font-medium text-zinc-600 mb-4">Full Stack Developer & Security Engineer</p>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-500">
                        <div className="flex items-center gap-1">
                            <MapPin size={12} /> Bangalore, India
                        </div>
                        <div className="flex items-center gap-1">
                            <Mail size={12} /> contact@sddion.dev
                        </div>
                        <div className="flex items-center gap-1">
                            <Github size={12} /> github.com/sddion
                        </div>
                    </div>
                </header>

                {/* Summary */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Profile</h2>
                    <p className="text-zinc-700">
                        Self-taught developer with a relentless "builder" mindset. Expertise in full-stack web development, automation scripting, and embedded systems.
                        Proven ability to handle real-world operations under pressure and deliver functional, deployed software.
                        Passionate about Linux systems, security tools, and creating unique user experiences.
                    </p>
                </section>

                {/* Experience */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Experience</h2>

                    <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-base">System Builder & Developer</h3>
                            <span className="text-xs font-mono text-zinc-500">2023 - Present</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-600 mb-2">Independent Project Phase</p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 marker:text-zinc-400">
                            <li>Developed <strong>Portfolio OS</strong>, a React-based Linux desktop simulation with window management and file system logic.</li>
                            <li>Building <strong>Bagley</strong>, an AI-powered IoT desktop assistant using ESP32 and Python.</li>
                            <li>Focused on "Execution &gt; Credentials", shipping real code and functional clones.</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-base">Quick Commerce Operations</h3>
                            <span className="text-xs font-mono text-zinc-500">Jan 2025</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-600 mb-2">Zepto (Bangalore)</p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 marker:text-zinc-400">
                            <li>Optimized hyper-local delivery workflows for speed and efficiency.</li>
                            <li>Managed high-pressure logistics in a fast-paced startup environment.</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-base">Operations Associate</h3>
                            <span className="text-xs font-mono text-zinc-500">2021 - 2022</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-600 mb-2">Swiggy</p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 marker:text-zinc-400">
                            <li>Executed ground-level logistics operations post-COVID lockdown.</li>
                            <li>Developed discipline and consistency in routing and customer service.</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-base">Founder</h3>
                            <span className="text-xs font-mono text-zinc-500">2017 - 2018</span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-600 mb-2">Apparel & Merchandise Business</p>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-zinc-700 marker:text-zinc-400">
                            <li>Founded and operated a profitable custom merchandise business for 1 year.</li>
                            <li>Handled end-to-end production, inventory management, and B2B/B2C sales.</li>
                        </ul>
                    </div>
                </section>

                {/* Skills */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Technical Skills</h2>
                    <div className="grid grid-cols-2 gap-y-2 text-zinc-700">
                        <div>
                            <span className="font-bold block text-xs uppercase text-zinc-500">Languages</span>
                            TypeScript, JavaScript, Python, Bash, C#
                        </div>
                        <div>
                            <span className="font-bold block text-xs uppercase text-zinc-500">Frontend</span>
                            React, Next.js, Tailwind CSS, Framer Motion
                        </div>
                        <div>
                            <span className="font-bold block text-xs uppercase text-zinc-500">Systems</span>
                            Linux (Kali/Arch), Arduino/ESP32, IoT
                        </div>
                        <div>
                            <span className="font-bold block text-xs uppercase text-zinc-500">Tools</span>
                            Git, VS Code, PowerShell, Docker
                        </div>
                    </div>
                </section>

                {/* Projects */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Key Projects</h2>

                    <div className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-sm">Bagley (AI Assistant)</h3>
                            <span className="text-xs text-zinc-500">Python, IoT, AI</span>
                        </div>
                        <p className="text-zinc-700 text-xs mt-1">
                            Desktop robot assistant integrating Voice-to-Text AI and real-time GitHub data fetching via real hardware (ESP32).
                        </p>
                    </div>

                    <div className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-bold text-sm">Portfolio OS</h3>
                            <span className="text-xs text-zinc-500">Next.js, TypeScript</span>
                        </div>
                        <p className="text-zinc-700 text-xs mt-1">
                            Fully functional browser-based operating system UI with window management, file system interaction, and terminal emulation.
                        </p>
                    </div>
                </section>

            </div>
        </div>
    )
}
