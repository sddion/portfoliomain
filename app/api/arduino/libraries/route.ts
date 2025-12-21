import { NextRequest, NextResponse } from 'next/server';
import { getOrCache } from '@/lib/Redis';

export interface LibraryInfo {
    name: string
    author: string
    description: string
    category: string
    architectures: string[]
    versions: string[]
    latestVersion: string
    url: string
    repository?: string
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.toLowerCase() || ''
    const limit = parseInt(searchParams.get('limit') || '0') || 0
    const offset = parseInt(searchParams.get('offset') || '0') || 0
    
    try {
        const allLibraries = await getOrCache('arduino:libraries:full', async () => {
            const response = await fetch('https://downloads.arduino.cc/libraries/library_index.json', {
                headers: { 'User-Agent': 'sddionOS-IDE/2.0' }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch library index: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data?.libraries) {
                return [];
            }

            // Process all libraries and group by name with all versions
            const librariesMap = new Map<string, LibraryInfo>();
            
            data.libraries.forEach((lib: any) => {
                const existing = librariesMap.get(lib.name);
                
                if (existing) {
                    // Add this version if not already present
                    if (!existing.versions.includes(lib.version)) {
                        existing.versions.push(lib.version);
                    }
                    // Update latest version if this one is newer
                    if (lib.version > existing.latestVersion) {
                        existing.latestVersion = lib.version;
                        existing.description = lib.sentence || lib.paragraph || existing.description;
                        existing.repository = lib.repository || existing.repository;
                    }
                } else {
                    librariesMap.set(lib.name, {
                        name: lib.name,
                        author: lib.author || 'Unknown',
                        description: lib.sentence || lib.paragraph || 'No description',
                        category: lib.category || 'Uncategorized',
                        architectures: lib.architectures || ['*'],
                        versions: [lib.version],
                        latestVersion: lib.version,
                        url: lib.website || `https://www.arduinolibraries.info/libraries/${lib.name.toLowerCase().replace(/ /g, '-')}`,
                        repository: lib.repository
                    });
                }
            });

            // Sort versions for each library (newest first)
            const libraries = Array.from(librariesMap.values()).map(lib => ({
                ...lib,
                versions: lib.versions.sort((a, b) => {
                    // Semantic version comparison
                    const aParts = a.split('.').map(Number);
                    const bParts = b.split('.').map(Number);
                    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                        const aVal = aParts[i] || 0;
                        const bVal = bParts[i] || 0;
                        if (bVal !== aVal) return bVal - aVal;
                    }
                    return 0;
                })
            }));

            // Sort libraries alphabetically
            return libraries.sort((a, b) => a.name.localeCompare(b.name));
        }, 3600 * 24); // Cache for 24 hours

        // Filter by search if provided
        let filteredLibraries = allLibraries as LibraryInfo[];
        
        if (search) {
            filteredLibraries = filteredLibraries.filter(lib => 
                lib.name.toLowerCase().includes(search) ||
                lib.description.toLowerCase().includes(search) ||
                lib.author.toLowerCase().includes(search) ||
                lib.category.toLowerCase().includes(search)
            );
        }

        const total = filteredLibraries.length;
        
        // Apply pagination if limit is specified
        if (limit > 0) {
            filteredLibraries = filteredLibraries.slice(offset, offset + limit);
        }

        return NextResponse.json({ 
            libraries: filteredLibraries,
            total,
            hasMore: limit > 0 ? (offset + limit) < total : false
        });
        
    } catch (error: any) {
        console.error('Arduino Library API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch libraries', 
            message: error.message 
        }, { status: 500 });
    }
}
