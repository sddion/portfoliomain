"use client"

import React, { useState } from "react"
import { FileText, AlertCircle } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

// Set worker source for pdf.js to CDN to ensure correct version and avoid build issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function ResumeApp() {
    const [numPages, setNumPages] = useState<number>(0)

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages)
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[var(--background)]">
            {/* Toolbar - Simplified (No toggle) */}
            <div className="h-12 bg-[var(--os-surface)] border-b border-[var(--os-border)] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 text-[var(--foreground)] text-sm font-medium">
                    <FileText size={16} />
                    <span>Resume.pdf</span>
                </div>
                <a href="/resume.pdf" download className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:opacity-80 text-[var(--primary-foreground)] rounded text-sm transition-opacity">
                    <FileText size={16} /> Download
                </a>
            </div>

            {/* Content Area - PDF Only */}
            <div className="flex-1 overflow-auto bg-[var(--background)] p-8 flex justify-center">
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
        </div>
    )
}
