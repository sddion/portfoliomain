"use client"

import React, { useState } from "react"
import { Printer, FileText, LayoutTemplate, AlertCircle } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

// Set worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export function ResumeApp() {
    const [mode, setMode] = useState<'html' | 'pdf'>('html')
    const [numPages, setNumPages] = useState<number>(0)
    const [pageNumber, setPageNumber] = useState(1)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-zinc-800">
            {/* Toolbar */}
            <div className="h-12 bg-zinc-900 border-b border-zinc-700 flex items-center justify-between px-4 shrink-0 print:hidden">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('html')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'html' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <LayoutTemplate size={16} /> Web View
                    </button>
                    <button
                        onClick={() => setMode('pdf')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === 'pdf' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <FileText size={16} /> Original PDF
                    </button>
                </div>

                {mode === 'html' && (
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black font-bold rounded text-sm transition-colors"
                    >
                        <Printer size={16} /> Print
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-zinc-800 p-8 flex justify-center">
                {mode === 'html' ? (
                    <div className="resume-paper w-[210mm] min-h-[297mm] bg-white text-zinc-900 shadow-2xl p-[15mm] font-sans text-sm leading-relaxed print:shadow-none print:w-full print:h-full print:p-0 print:m-0">
                        <header className="border-b-2 border-zinc-900 pb-6 mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-extrabold uppercase tracking-tight text-zinc-900 mb-1">Sanju</h1>
                                <p className="text-lg font-medium text-zinc-600">Full Stack Developer & Security Engineer</p>
                            </div>
                            <div className="text-right text-xs leading-relaxed text-zinc-600">
                                <p>India</p>
                                <p>github.com/sddion</p>
                                <p className="flex justify-end gap-1 font-mono">
                                    {/* Encoded Phone Number for Anti-Spam */}
                                    <span style={{ unicodeBidi: 'bidi-override', direction: 'rtl' }}>70629228819+</span>
                                </p>
                            </div>
                        </header>

                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Professional Summary</h2>
                            <p className="text-zinc-700 leading-relaxed">
                                Self-taught full-stack developer and security enthusiast with a strong foundation in building scalable web applications, automating system operations, and exploring embedded hardware limits. Passionate about "learning by doing," with a diverse portfolio ranging from complex OS simulations to practical e-commerce solutions. Adept at rapid prototyping, debugging complex systems, and delivering secure, performant software.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Technical Skills</h2>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <h3 className="font-bold mb-1">Languages</h3>
                                    <p className="text-zinc-600">TypeScript, JavaScript (ES6+), Python, Bash, C++, HTML5/CSS3</p>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Frontend</h3>
                                    <p className="text-zinc-600">React.js, Next.js, Tailwind CSS, Framer Motion, Redux</p>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Backend & DevOps</h3>
                                    <p className="text-zinc-600">Node.js, Express, MongoDB, Linux (Kali/Ubuntu), Docker, Git</p>
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Security & Hardware</h3>
                                    <p className="text-zinc-600">Penetration Testing, Bash Scripting, Arduino, ESP32/8266</p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Experience</h2>

                            <div className="mb-6">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base">Independent Developer & Researcher</h3>
                                    <span className="text-xs font-semibold text-zinc-500">2023 - Present</span>
                                </div>
                                <ul className="list-disc ml-4 text-zinc-700 space-y-1">
                                    <li>Architected and built <strong>SanjuOS</strong>, a web-based operating system portfolio featuring a functional window manager, terminal emulator and responsive UI.</li>
                                    <li>Developed <strong>Bagley</strong>, a personal AI assistant integrated into desktop workflows for automation.</li>
                                    <li>Conducted security research on local network vulnerabilities, creating custom Bash tools for network auditing.</li>
                                    <li>Engineered multiple full-stack prototypes including e-commerce platforms and real-time chat applications.</li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-base">Delivery Roles (Swiggy / Zepto / Zomato)</h3>
                                    <span className="text-xs font-semibold text-zinc-500">2021 - 2023</span>
                                </div>
                                <p className="text-zinc-700 mb-2">
                                    Gained critical insights into logistics, high-pressure operations, and user-facing service delivery. This experience honed my problem-solving skills and resilience in fast-paced environments.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-300 pb-1 mb-3 text-zinc-400">Projects</h2>

                            <div className="mb-4">
                                <h3 className="font-bold text-sm">Portfolio OS (Web)</h3>
                                <p className="text-zinc-700">
                                    A  React application mimicking a Linux desktop environment. Features include a custom window management system, terminal interactions, theme switching, and real-time API integrations.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-sm">Hardware Automation</h3>
                                <p className="text-zinc-700">
                                    Created custom scripts for ESP8266 microcontrollers to automate home network tasks.
                                </p>
                            </div>
                        </section>

                        <footer className="mt-12 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
                            <p>&copy; {new Date().getFullYear()} Sanju</p>
                        </footer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-zinc-900 p-4 rounded text-center text-zinc-400 max-w-md border border-zinc-700">
                        </div>
                        <div className="shadow-2xl">
                            <Document file="/resume.pdf" onLoadSuccess={onDocumentLoadSuccess} className="flex flex-col gap-4">
                                {Array.from(new Array(numPages), (el, index) => (
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
                )}
            </div>
        </div>
    )
}
