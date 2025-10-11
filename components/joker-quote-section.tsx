"use client"

import Image from "next/image"

export function JokerQuoteSection() {
    return (
        <div className="relative w-full min-h-[780px] flex items-center justify-center overflow-hidden my-12">
            {/* Background Image with overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/image_10463403.png"
                    alt="Joker card illustration"
                    fill
                    className="object-cover opacity-10 dark:opacity-15 filter contrast-125 dark:contrast-100"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            {/* Quote Container */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <blockquote className="space-y-4">
                    <p className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-foreground/90 leading-relaxed">
                        &ldquo;A jack of all trades is a master of none,{" "}
                        <span className="font-medium">
                            but oftentimes better than a master of one&rdquo;
                        </span>
                    </p>
                    <footer className="text-sm md:text-base text-foreground/60 italic mt-4">
                        &mdash; Unknown 
                    </footer>
                </blockquote>
            </div>
        </div>
    )
}