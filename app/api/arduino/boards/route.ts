import { NextResponse } from 'next/server';
import { getOrCache } from '@/lib/Redis';

const ESP32_INDEX_URL = 'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json';
const ESP8266_INDEX_URL = 'https://arduino.esp8266.com/stable/package_esp8266com_index.json';

export async function GET() {
  try {
    const boards = await getOrCache('arduino:boards', async () => {
        // Fetch both indices in parallel
        const [esp32Res, esp8266Res] = await Promise.all([
          fetch(ESP32_INDEX_URL),
          fetch(ESP8266_INDEX_URL)
        ]);

        let esp32Boards: string[] = [];
        let esp8266Boards: string[] = [];

        if (esp32Res.ok) {
            const data = await esp32Res.json();
            const platform = data.packages[0].platforms[0];
            if (platform && platform.boards) {
                esp32Boards = platform.boards.map((b: any) => b.name);
            }
        }

        if (esp8266Res.ok) {
            const data = await esp8266Res.json();
            const platform = data.packages[0].platforms[0];
            if (platform && platform.boards) {
                esp8266Boards = platform.boards.map((b: any) => b.name);
            }
        }

        return {
            esp32: Array.from(new Set(esp32Boards)).sort(),
            esp8266: Array.from(new Set(esp8266Boards)).sort()
        };
    }, 86400); // 24 hours

    return NextResponse.json(boards);
  } catch (error: any) {
    console.error('Board API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch boards', message: error.message }, { status: 500 });
  }
}
