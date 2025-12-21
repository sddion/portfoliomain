import { NextRequest, NextResponse } from 'next/server'

// This endpoint manages library installation tracking
// In a full implementation, this would interact with the compilation service
// For now, it handles local state management on the client side

export interface LibraryInstallRequest {
    library: string
    version?: string
    action: 'install' | 'uninstall'
}

export interface LibraryInstallResponse {
    success: boolean
    message: string
    library: string
    version?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: LibraryInstallRequest = await request.json()

        if (!body.library) {
            return NextResponse.json({
                success: false,
                message: 'Library name required'
            }, { status: 400 })
        }

        // In a full implementation, this would:
        // 1. Call the compilation service to install/cache the library
        // 2. Return confirmation of installation
        // For now, we just acknowledge the request (client manages state)
        
        const action = body.action || 'install'
        
        return NextResponse.json({
            success: true,
            message: `Library ${body.library} ${action === 'install' ? 'installed' : 'uninstalled'} successfully`,
            library: body.library,
            version: body.version || 'latest'
        })

    } catch (error: any) {
        console.error('Library install error:', error)
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to process library request'
        }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    // Return info about how library installation works
    return NextResponse.json({
        description: 'Library installation management endpoint',
        usage: {
            install: 'POST { library: "ArduinoJson", version: "7.0.4", action: "install" }',
            uninstall: 'POST { library: "ArduinoJson", action: "uninstall" }'
        },
        note: 'Library installation is tracked client-side. For real compilation, libraries are resolved by the compilation service.'
    })
}
