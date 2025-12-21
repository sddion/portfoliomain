import { NextRequest, NextResponse } from 'next/server'

// Compilation service URL - must be set in environment
const COMPILE_SERVICE_URL = process.env.COMPILE_SERVICE_URL || ''

// Board FQBN mappings for common boards
const BOARD_FQBN_MAP: Record<string, string> = {
    // ESP32 variants
    'ESP32 Dev Module': 'esp32:esp32:esp32',
    'ESP32-S2 Dev Module': 'esp32:esp32:esp32s2',
    'ESP32-S3 Dev Module': 'esp32:esp32:esp32s3',
    'ESP32-C3 Dev Module': 'esp32:esp32:esp32c3',
    'NodeMCU-32S': 'esp32:esp32:nodemcu-32s',
    'LOLIN D32': 'esp32:esp32:d32',
    'LOLIN D32 Pro': 'esp32:esp32:d32_pro',
    // ESP8266 variants
    'Generic ESP8266 Module': 'esp8266:esp8266:generic',
    'NodeMCU 1.0': 'esp8266:esp8266:nodemcuv2',
    'Wemos D1 Mini': 'esp8266:esp8266:d1_mini',
    // Arduino AVR
    'Arduino Uno': 'arduino:avr:uno',
    'Arduino Mega': 'arduino:avr:mega',
    'Arduino Nano': 'arduino:avr:nano',
    'Arduino Leonardo': 'arduino:avr:leonardo',
    // Arduino SAMD
    'Arduino MKR WiFi 1010': 'arduino:samd:mkrwifi1010',
    'Arduino Nano 33 IoT': 'arduino:samd:nano_33_iot',
}

export interface CompileRequest {
    code: string
    board: string
    libraries?: string[]
    verbose?: boolean
}

export interface CompileResponse {
    success: boolean
    binary?: string // base64 encoded
    size?: number
    errors?: string[]
    warnings?: string[]
    output?: string[]
}

// Compile via external Arduino compilation service
async function compileViaService(request: CompileRequest): Promise<CompileResponse> {
    if (!COMPILE_SERVICE_URL) {
        return {
            success: false,
            errors: ['Compilation service not configured. Set COMPILE_SERVICE_URL environment variable.']
        }
    }

    const fqbn = BOARD_FQBN_MAP[request.board] || request.board

    try {
        const response = await fetch(`${COMPILE_SERVICE_URL}/compile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sketch: request.code,
                fqbn: fqbn,
                libraries: request.libraries || [],
                verbose: request.verbose || false
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            return {
                success: false,
                errors: [`Compilation service error: ${response.status} - ${errorText}`]
            }
        }

        const result = await response.json()
        return result

    } catch (error: any) {
        return {
            success: false,
            errors: [`Failed to connect to compilation service: ${error.message}`]
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: CompileRequest = await request.json()

        if (!body.code) {
            return NextResponse.json({
                success: false,
                errors: ['No code provided']
            }, { status: 400 })
        }

        if (!body.board) {
            return NextResponse.json({
                success: false,
                errors: ['No board specified']
            }, { status: 400 })
        }

        // Compile via service - no fallback, real compilation only
        if (!COMPILE_SERVICE_URL) {
            return NextResponse.json({
                success: false,
                errors: ['Compilation service not configured. Set COMPILE_SERVICE_URL environment variable.']
            }, { status: 503 })
        }

        const result = await compileViaService(body)
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Compile API Error:', error)
        return NextResponse.json({
            success: false,
            errors: [`Internal server error: ${error.message}`]
        }, { status: 500 })
    }
}

// GET endpoint to check compilation service status
export async function GET() {
    const serviceConfigured = !!COMPILE_SERVICE_URL
    let serviceOnline = false

    if (serviceConfigured) {
        try {
            const response = await fetch(`${COMPILE_SERVICE_URL}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            })
            serviceOnline = response.ok
        } catch {
            serviceOnline = false
        }
    }

    return NextResponse.json({
        serviceConfigured,
        serviceOnline,
        supportedBoards: Object.keys(BOARD_FQBN_MAP)
    })
}
