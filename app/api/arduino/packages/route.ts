import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Initialize Redis
// Note: In a real deployment, these would come from process.env
// For this environment, if env vars are missing, we might fallback or warn.
// Assuming the user has set up the env vars or we simulate it.
// Since we don't have the actual keys, we'll wrap usage in a try/catch or check.
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const CACHE_KEY = 'arduino_package_index';
const CACHE_TTL = 3600 * 24; // 24 hours

// List of keywords/platforms related to the user's requested boards
const TARGET_ARCHITECTURES = [
    "avr", "samd", "sam", "esp32", "esp8266", "stm32", "renesas_uno", "mbed", "nrf52", "megaavr"
];

// Helper to check if a package matches our target list
// The user asked for specific boards. Most belong to specific cores.
// We will filter by architecture and also check board names if possible (though board names are deep in versions).
// To keep it performant, we'll include major official platforms and the ESP/STM32 community ones.
const INCLUDED_PACKAGES = [
    "arduino", "esp32", "esp8266", "stm32duino", "adafruit", "sparkfun"
];

export async function GET() {
    try {
        let packageIndex: any = null;

        // 1. Try Cache
        if (redis) {
            try {
                // Check cache
                const cached = await redis.get(CACHE_KEY);
                if (cached) {
                    // console.log("Cache HIT");
                    return NextResponse.json(cached);
                }
            } catch (e) {
                console.warn("Redis error:", e);
                // Fallback to fetch
            }
        }

        // 2. Fetch from Arduino
        // console.log("Cache MISS, Fetching from source...");
        const response = await fetch('https://downloads.arduino.cc/packages/package_index.json', {
            headers: { 'User-Agent': 'sddionOS-IDE/1.0' },
            next: { revalidate: 3600 }
        })

        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        
        const data = await response.json();

        // 3. Process & Filter Data
        // The file is huge. We MUST filter it before returning or caching.
        const packages = data.packages
            .filter((pkg: any) => INCLUDED_PACKAGES.includes(pkg.name) || pkg.maintainer === "Arduino")
            .map((pkg: any) => {
                // Get platforms
                const platforms = pkg.platforms || [];
                
                // We usually just want the latest version's details for the "card",
                // but we also want a list of all versions.
                // Platforms array here contains ALL versions flattened? No, usually grouped by architecture but Arduino structure is weird.
                // In package_index.json, `platforms` is an array of version objects.
                
                // We want to group by architecture/name.
                // Actually, `pkg.platforms` is a list of every version of every core provided by that package.
                // e.g. "Arduino AVR Boards" v1.8.6, v1.8.5...
                
                // Let's group them uniquely by `architecture`.
                // For simplicity in this demo, let's take the latest version of each unique architecture.
                
                // Sort by version (semver roughly)
                // Just taking the array as is might be too big.
                
                // Let's filter platforms by our target architectures
                const relevantPlatforms = platforms.filter((p: any) => TARGET_ARCHITECTURES.includes(p.architecture));

                if (relevantPlatforms.length === 0) return null;

                // Find the latest version for each unique name/arch
                // The API consumer expects a list of "BoardPlatforms". 
                // Since this map returns a "Package", we need to flatten it later or adjust the IDEApp logic.
                // IDEApp expects a flat list of `BoardPlatform`.
                // So let's return the simplified flat list directly from here to save bandwidth.
                return relevantPlatforms;
            })
            .flat()
            .filter(Boolean) // Remove nulls
            // Now we have a list of platform versions. We need to deduplicate and merge versions.
            .reduce((acc: any[], curr: any) => {
                const existing = acc.find(p => p.name === curr.name && p.architecture === curr.architecture);
                if (existing) {
                    existing.versions.push(curr.version);
                    // Update to latest version details if current is newer? 
                    // Simple string comparison for now, or assume array is roughly order? 
                    // Usually package index is sorted. Let's just keep all versions array.
                    // We'll trust the default "version" is the latest one we encountered (if we iterate correctly)
                    // or we specifically look for the highest.
                } else {
                    acc.push({
                        ...curr,
                        versions: [curr.version],
                        // Extract board names for search
                        boards: curr.boards ? curr.boards.map((b: any) => ({ name: b.name, id: b.name })) : []
                    });
                }
                return acc;
            }, [])
            .map((p: any) => {
                 // Clean up for frontend
                 return {
                     id: p.name.replace(/\s+/g, '-').toLowerCase(),
                     name: p.name,
                     version: p.version, // Ideally this should be the latest
                     versions: p.versions.sort().reverse(), // Simple sort, reverse for latest first
                     architecture: p.architecture,
                     installed: p.name.includes("AVR") || p.name.includes("ESP32"), // Mock default install
                     description: `Support for ${p.architecture.toUpperCase()} boards.`, // Simplified desc
                     boards: p.boards
                 };
            });

        const result = { packages: packages };

        // 4. Cache
        if (redis) {
            await redis.set(CACHE_KEY, JSON.stringify(result), { ex: CACHE_TTL });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching Arduino packages:', error);
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}
