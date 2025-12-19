"use client"

import React, { useState } from "react"
import { FileText, AlertCircle, Layout, Calendar, Briefcase, GraduationCap, Code, Star, Download, ChevronRight } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

// Set worker source for pdf.js to CDN to ensure correct version and avoid build issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function ResumeApp() {
    const [numPages, setNumPages] = useState<number>(0)
    const [isInteractive, setIsInteractive] = useState(true)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    const experience = [
        {
            company: "Self-Employed / Open Source",
            role: "Security Researcher & Full-Stack Dev",
            period: "2022 - Present",
            desc: "Developed SanjuOS, a browser-based operating system. Built advanced IoT tools and contributed to security research."
        },
        {
            company: "DeepMind Collaborative Project",
            role: "Frontend Engineer (Contract)",
            period: "2023 - 2024",
            desc: "Optimized interactive UIs for agentic AI applications. Focused on performance and responsive design."
        }
    ]

    const skills = [
        { name: "React / Next.js", level: 95 },
        { name: "Node.js / Express", level: 88 },
        { name: "Embedded (C++/ESP32)", level: 85 },
        { name: "Cybersecurity (Web/Network)", level: 92 },
        { name: "TypeScript / UI/UX", level: 90 }
    ]

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[var(--background)]">
            {/* Toolbar */}
            <div className="h-12 bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setIsInteractive(true)}
                            className={`px-3 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all ${isInteractive ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Layout size={12} /> Interactive
                        </button>
                        <button
                            onClick={() => setIsInteractive(false)}
                            className={`px-3 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all ${!isInteractive ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <FileText size={12} /> PDF
                        </button>
                    </div>
                </div>
                <a href="/resume.pdf" download className="flex items-center gap-2 px-3 py-1 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30 rounded text-xs font-bold transition-all">
                    <Download size={14} /> Resume.pdf
                </a>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[var(--background)]">
                {isInteractive ? (
                    <div className="max-w-4xl mx-auto p-6 sm:p-12 space-y-12">
                        {/* Summary Header */}
                        <header className="space-y-4 text-center sm:text-left">
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-[var(--foreground)]">SANJU<span className="text-[var(--primary)]">.SYS</span></h1>
                            <p className="text-lg text-[var(--foreground)]/60 font-medium max-w-2xl leading-relaxed">
                                Security-focused full-stack developer with a passion for building complex, browser-based systems and hardware integrations.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-12">
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)] flex items-center gap-2">
                                        <Briefcase size={14} /> Experience History
                                    </h3>
                                    <div className="space-y-8">
                                        {experience.map((exp, i) => (
                                            <div key={i} className="relative pl-8 border-l border-[var(--os-border)]">
                                                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[var(--primary)]" />
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{exp.period}</span>
                                                    <h4 className="text-xl font-bold text-[var(--foreground)]">{exp.role}</h4>
                                                    <p className="text-sm font-bold text-[var(--foreground)]/40 italic">{exp.company}</p>
                                                    <p className="text-sm text-[var(--foreground)]/70 mt-2 leading-relaxed">{exp.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)] flex items-center gap-2">
                                        <GraduationCap size={14} /> Education & Research
                                    </h3>
                                    <div className="p-6 bg-[var(--os-surface)] border border-[var(--os-border)] rounded-2xl">
                                        <h4 className="text-lg font-bold text-[var(--foreground)]">Computer Science & Cyber Security</h4>
                                        <p className="text-sm text-[var(--foreground)]/60 italic">Advanced Self-Taught Curriculum</p>
                                        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                            {['Network Security', 'Reverse Engineering', 'Microcontroller Logic', 'System Architecture'].map(t => (
                                                <span key={t} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="space-y-12">
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)] flex items-center gap-2">
                                        <Star size={14} /> Tech Proficiency
                                    </h3>
                                    <div className="space-y-6">
                                        {skills.map(skill => (
                                            <div key={skill.name} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60">
                                                    <span>{skill.name}</span>
                                                    <span>{skill.level}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-[var(--os-border)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${skill.level}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="p-6 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl space-y-4">
                                    <h3 className="text-xs font-black uppercase text-[var(--primary)] tracking-widest">Connect_Direct</h3>
                                    <p className="text-xs text-[var(--foreground)]/50 leading-loose uppercase font-bold">
                                        Available for contract security audits and performant frontend development.
                                    </p>
                                    <button className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-opacity">
                                        Request Interview
                                    </button>
                                </section>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 flex justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="shadow-2xl">
                                <Document
                                    file="/resume.pdf"
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    onLoadError={(error) => {
                                        console.error("Error loading PDF:", error)
                                    }}
                                    error={
                                        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg text-center max-w-md">
                                            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                                            <h3 className="text-red-400 font-bold mb-1">Failed to load PDF</h3>
                                            <p className="text-zinc-400 text-sm mb-4">The PDF file could not be rendered.</p>
                                            <a href="/resume.pdf" download className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold inline-flex items-center gap-2">
                                                <FileText size={16} /> Download PDF
                                            </a>
                                        </div>
                                    }
                                    loading={
                                        <div className="flex flex-col items-center gap-2 text-zinc-500 py-10">
                                            <div className="animate-spin w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full" />
                                            <span className="text-sm">Loading resume...</span>
                                        </div>
                                    }
                                    className="flex flex-col gap-4"
                                >
                                    {numPages > 0 && Array.from(new Array(numPages), (el, index) => (
                                        <Page
                                            key={`page_${index + 1}`}
                                            pageNumber={index + 1}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            scale={1.2}
                                        />
                                    ))}
                                </Document>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
