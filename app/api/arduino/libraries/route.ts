import { NextResponse } from 'next/server';
import { getOrCache } from '@/lib/Redis';

export async function GET() {
  try {
    const libraries = await getOrCache('arduino:libraries', async () => {
      const response = await fetch('https://downloads.arduino.cc/libraries/library_index.json');
      
      if (!response.ok) {
          throw new Error(`Failed to fetch library index: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.libraries) {
          const processedLibraries = data.libraries.map((lib: any) => ({
              name: lib.name,
              version: lib.version,
              author: lib.author,
              description: lib.sentence || lib.paragraph || 'No description',
              url: lib.website || `https://www.arduinolibraries.info/libraries/${lib.name.toLowerCase().replace(/ /g, '-')}`
          }));

          // Group by name and keep only the latest version of each library
          const uniqueLibsMap = new Map();
          processedLibraries.forEach((lib: any) => {
              const current = uniqueLibsMap.get(lib.name);
              if (!current || lib.version > current.version) {
                  uniqueLibsMap.set(lib.name, lib);
              }
          });

          return Array.from(uniqueLibsMap.values());
      }
      return [];
    }, 3600 * 24); // Cache for 24 hours

    return NextResponse.json({ libraries });
  } catch (error: any) {
    console.error('Arduino Library API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch libraries', message: error.message }, { status: 500 });
  }
}
