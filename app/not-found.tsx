"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">404</h1>
                <h2 className="text-xl text-muted-foreground">Page Not Found</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Button asChild>
                    <Link href="/">
                        Return Home
                    </Link>
                </Button>
            </div>
        </div>
    )
}