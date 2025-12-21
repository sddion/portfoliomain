import { NextRequest, NextResponse } from 'next/server'
import { getOrCache } from '@/lib/Redis'

// All package index URLs - these are pre-configured so users don't need to add them manually
const PACKAGE_INDEX_URLS = [
    { url: 'https://downloads.arduino.cc/packages/package_index.json', name: 'Arduino Official' },
    { url: 'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json', name: 'ESP32' },
    { url: 'https://arduino.esp8266.com/stable/package_esp8266com_index.json', name: 'ESP8266' },
    { url: 'https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json', name: 'STM32' },
]

// Pre-installed platforms (users don't need to install these manually)
const PRE_INSTALLED_ARCHITECTURES = ['esp32', 'esp8266', 'stm32']

export interface BoardPlatform {
    id: string
    name: string
    version: string
    versions: string[]
    architecture: string
    installed: boolean
    preInstalled: boolean
    description: string
    boards: { name: string; id: string }[]
    maintainer: string
    url: string
}

async function fetchPackageIndex(url: string): Promise<any> {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'sddionOS-IDE/2.0' },
        })
        if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`)
            return null
        }
        return await response.json()
    } catch (error) {
        console.warn(`Error fetching ${url}:`, error)
        return null
    }
}

function processPackages(data: any, source: string): BoardPlatform[] {
    if (!data?.packages) return []

    const platforms: BoardPlatform[] = []
    const platformMap = new Map<string, BoardPlatform>()

    data.packages.forEach((pkg: any) => {
        const pkgPlatforms = pkg.platforms || []

        pkgPlatforms.forEach((platform: any) => {
            const key = `${platform.name}-${platform.architecture}`
            const existing = platformMap.get(key)

            if (existing) {
                // Add version if not present
                if (!existing.versions.includes(platform.version)) {
                    existing.versions.push(platform.version)
                }
            } else {
                const isPreInstalled = PRE_INSTALLED_ARCHITECTURES.includes(platform.architecture)
                
                platformMap.set(key, {
                    id: `${pkg.name}:${platform.architecture}`,
                    name: platform.name,
                    version: platform.version,
                    versions: [platform.version],
                    architecture: platform.architecture,
                    installed: isPreInstalled,
                    preInstalled: isPreInstalled,
                    description: platform.name || `Support for ${platform.architecture} boards`,
                    boards: (platform.boards || []).map((b: any) => ({
                        name: b.name,
                        id: b.name.replace(/\s+/g, '_').toLowerCase()
                    })),
                    maintainer: pkg.maintainer || 'Unknown',
                    url: platform.url || ''
                })
            }
        })
    })

    // Sort versions for each platform (newest first)
    platformMap.forEach(platform => {
        platform.versions.sort((a, b) => {
            const aParts = a.split('.').map(Number)
            const bParts = b.split('.').map(Number)
            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                const aVal = aParts[i] || 0
                const bVal = bParts[i] || 0
                if (bVal !== aVal) return bVal - aVal
            }
            return 0
        })
        // Update version to latest
        platform.version = platform.versions[0]
    })

    return Array.from(platformMap.values())
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.toLowerCase() || ''

    try {
        const allPackages = await getOrCache('arduino:packages:all', async () => {
            // Fetch all package indexes in parallel
            const indexPromises = PACKAGE_INDEX_URLS.map(source => fetchPackageIndex(source.url))
            const indexResults = await Promise.all(indexPromises)

            // Process and merge all packages
            const allPlatforms: BoardPlatform[] = []
            const platformMap = new Map<string, BoardPlatform>()

            indexResults.forEach((data, idx) => {
                if (!data) return
                const source = PACKAGE_INDEX_URLS[idx].name
                const platforms = processPackages(data, source)

                platforms.forEach(platform => {
                    const key = platform.id
                    const existing = platformMap.get(key)

                    if (existing) {
                        // Merge versions
                        platform.versions.forEach(v => {
                            if (!existing.versions.includes(v)) {
                                existing.versions.push(v)
                            }
                        })
                        // Merge boards
                        platform.boards.forEach(b => {
                            if (!existing.boards.find(eb => eb.id === b.id)) {
                                existing.boards.push(b)
                            }
                        })
                    } else {
                        platformMap.set(key, platform)
                    }
                })
            })

            // Convert to array and sort alphabetically
            const result = Array.from(platformMap.values())
                .sort((a, b) => a.name.localeCompare(b.name))

            return result
        }, 3600 * 24) // Cache for 24 hours

        // Filter by search if provided
        let filteredPackages = allPackages as BoardPlatform[]

        if (search) {
            filteredPackages = filteredPackages.filter(pkg =>
                pkg.name.toLowerCase().includes(search) ||
                pkg.architecture.toLowerCase().includes(search) ||
                pkg.maintainer.toLowerCase().includes(search) ||
                pkg.boards.some(b => b.name.toLowerCase().includes(search))
            )
        }

        // Count total boards across all packages
        const totalBoards = filteredPackages.reduce((acc, pkg) => acc + pkg.boards.length, 0)

        return NextResponse.json({
            packages: filteredPackages,
            total: filteredPackages.length,
            totalBoards,
            sources: PACKAGE_INDEX_URLS.map(s => s.name)
        })

    } catch (error) {
        console.error('Error fetching Arduino packages:', error)
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }
}
