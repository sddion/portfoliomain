#!/bin/bash

# SanjuOS One-Click Desktop Installer for Linux
# This script creates a desktop entry to launch SanjuOS in standalone app mode.

APP_NAME="SanjuOS"
APP_URL="https://sddion.vercel.app/"
ICON_PATH="$HOME/.local/share/icons/sanjuos.png"
DESKTOP_FILE="$HOME/.local/share/applications/sanjuos.desktop"

echo "Installing $APP_NAME..."

# Download the icon
curl -s -o "$ICON_PATH" "https://sddion.vercel.app/icon-512.png"

# Check if chrome/chromium is installed
LAUNCHER=""
if command -v google-chrome &> /dev/null; then
    LAUNCHER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    LAUNCHER="chromium-browser"
elif command -v chromium &> /dev/null; then
    LAUNCHER="chromium"
else
    echo "Warning: No Chrome-based browser found. Defaulting to system browser."
    LAUNCHER="xdg-open"
fi

# Create desktop entry
cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=Advanced ESP32 Web Flasher & Security Portfolio
Exec=$LAUNCHER --app=$APP_URL
Icon=$ICON_PATH
Terminal=false
Categories=Development;Electronics;
StartupWMClass=sanjuos
EOF

chmod +x "$DESKTOP_FILE"

echo "Installation complete! You can now find $APP_NAME in your application menu."
