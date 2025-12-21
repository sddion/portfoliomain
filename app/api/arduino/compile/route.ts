import { NextRequest, NextResponse } from 'next/server'
import { getOrCache } from '@/lib/Redis'

// Compilation service URL - should be set in environment
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

// Fallback: Direct compilation via external service
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

// Mock compilation for development/demo when service is unavailable
function mockCompile(request: CompileRequest): CompileResponse {
    const code = request.code || ''
    const fqbn = BOARD_FQBN_MAP[request.board] || request.board
    
    // Basic syntax validation
    const errors: string[] = []
    const warnings: string[] = []
    const output: string[] = []

    output.push(`Arduino Compilation Service (Mock Mode)`)
    output.push(`Board: ${request.board} (${fqbn})`)
    output.push(`Sketch size: ${code.length} characters`)
    output.push(``)

    // Check for common syntax errors
    const braceOpen = (code.match(/{/g) || []).length
    const braceClose = (code.match(/}/g) || []).length
    if (braceOpen !== braceClose) {
        errors.push(`sketch.ino: error: Mismatched braces. Found ${braceOpen} '{' and ${braceClose} '}'`)
    }

    const parenOpen = (code.match(/\(/g) || []).length
    const parenClose = (code.match(/\)/g) || []).length
    if (parenOpen !== parenClose) {
        errors.push(`sketch.ino: error: Mismatched parentheses. Found ${parenOpen} '(' and ${parenClose} ')'`)
    }

    // Check for setup() and loop()
    if (!code.includes('void setup()') && !code.includes('void setup ()')) {
        errors.push(`sketch.ino: error: 'setup' function not defined`)
    }
    if (!code.includes('void loop()') && !code.includes('void loop ()')) {
        errors.push(`sketch.ino: error: 'loop' function not defined`)
    }

    // Check for missing semicolons (basic heuristic)
    const lines = code.split('\n')
    lines.forEach((line, idx) => {
        const trimmed = line.trim()
        // Skip empty lines, comments, preprocessor, braces, control statements
        if (!trimmed || 
            trimmed.startsWith('//') || 
            trimmed.startsWith('#') ||
            trimmed.startsWith('/*') ||
            trimmed.startsWith('*') ||
            trimmed.endsWith('{') ||
            trimmed.endsWith('}') ||
            trimmed === '{' ||
            trimmed === '}' ||
            trimmed.startsWith('if') ||
            trimmed.startsWith('else') ||
            trimmed.startsWith('for') ||
            trimmed.startsWith('while') ||
            trimmed.startsWith('switch') ||
            trimmed.startsWith('case') ||
            trimmed.startsWith('default') ||
            trimmed.startsWith('void ') ||
            trimmed.startsWith('int ') ||
            trimmed.startsWith('float ') ||
            trimmed.startsWith('char ') ||
            trimmed.startsWith('bool ') ||
            trimmed.startsWith('class ') ||
            trimmed.startsWith('struct ') ||
            trimmed.startsWith('public:') ||
            trimmed.startsWith('private:') ||
            trimmed.startsWith('protected:')) {
            return
        }
        // Check if line ends with statement and no semicolon
        if (trimmed.match(/[a-zA-Z0-9_)\]"']$/) && !trimmed.endsWith(')') && 
            !trimmed.includes('//') && trimmed.length > 3) {
            warnings.push(`sketch.ino:${idx + 1}: warning: Possible missing semicolon`)
        }
    })

    if (errors.length > 0) {
        output.push(`Compilation failed with ${errors.length} error(s)`)
        return {
            success: false,
            errors,
            warnings,
            output
        }
    }

    // Calculate mock binary size based on code complexity
    const baseSize = fqbn.includes('esp32') ? 250000 : fqbn.includes('esp8266') ? 200000 : 15000
    const codeSize = Math.round(code.length * 1.2)
    const totalSize = baseSize + codeSize

    output.push(`Compiling sketch...`)
    output.push(`Linking...`)
    output.push(`Creating binary...`)
    output.push(``)
    output.push(`Sketch uses ${totalSize} bytes (${Math.round(totalSize / (fqbn.includes('esp') ? 1310720 : 32256) * 100)}%) of program storage space.`)
    output.push(`Global variables use ${Math.round(totalSize * 0.15)} bytes of dynamic memory.`)
    output.push(``)
    output.push(`Compilation complete.`)

    // Generate mock binary (just a placeholder - real compilation needed for actual flashing)
    const mockBinary = Buffer.from(`MOCK_BINARY_${Date.now()}_${fqbn}`).toString('base64')

    return {
        success: true,
        binary: mockBinary,
        size: totalSize,
        warnings,
        output
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

        // Try compilation service
        if (COMPILE_SERVICE_URL) {
            const result = await compileViaService(body)
            return NextResponse.json(result)
        }

        // No service configured
        return NextResponse.json({
            success: false,
            errors: ['Compilation service not configured. Set COMPILE_SERVICE_URL environment variable.']
        }, { status: 503 })

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
