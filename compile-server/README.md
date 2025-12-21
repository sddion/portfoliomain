# Compile Server

A Docker-based arduino-cli compilation server for the sddionOS IDE.

## Deploy to Render (Free)

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
   (no credit card needed)

2. **New Web Service**: Click "New" → "Web Service"

3. **Connect this repo** or use Docker directly:
   - Root directory: `compile-server`
   - Environment: Docker
   - Instance Type: Free

4. **Get URL**: After deployment, copy the URL (e.g.,
   `https://your-app.onrender.com`)

5. **Set Env Variable**: In your portfolio deployment, set:
   ```
   COMPILE_SERVICE_URL=https://your-app.onrender.com
   ```

## Keep Alive (Optional)

Free Render instances sleep after 15 min inactivity. To keep awake:

1. Go to [uptimerobot.com](https://uptimerobot.com) (free)
2. Add monitor: HTTP(s)
3. URL: `https://your-app.onrender.com/health`
4. Interval: 5 minutes

## Local Development

```bash
cd compile-server
npm install
node server.js
```

## API

### GET /health

Check server status.

### POST /compile

```json
{
    "sketch": "void setup() {} void loop() {}",
    "fqbn": "ESP32 Dev Module",
    "libraries": ["WiFi"],
    "verbose": false
}
```

Returns:

```json
{
    "success": true,
    "binary": "base64...",
    "size": 250000,
    "output": ["..."]
}
```

## Supported Boards

- ESP32 Dev Module, S2, S3, C3
- NodeMCU (ESP8266)
- Wemos D1 Mini
- Arduino Uno, Mega, Nano
