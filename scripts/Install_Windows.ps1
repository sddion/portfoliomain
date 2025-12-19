# SanjuOS One-Click Installer for Windows
# This script creates a desktop shortcut to launch SanjuOS in app mode.

$appName = "SanjuOS"
$appUrl = "https://sddion.vercel.app/"
$iconUrl = "https://sddion.vercel.app/icon-512.png"
$iconPath = "$env:USERPROFILE\Pictures\sanjuos.ico"

Write-Host "Installing $appName..."

# Download the high-quality branded icon
Invoke-WebRequest -Uri "https://sddion.vercel.app/favicon.ico" -OutFile "$iconPath" -ErrorAction SilentlyContinue

$WshShell = New-Object -ComObject WScript.Shell
$ShortcutPath = "$env:USERPROFILE\Desktop\$appName.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Check for Edge or Chrome
if (Test-Path "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe") {
    $Shortcut.TargetPath = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
} elseif (Test-Path "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe") {
    $Shortcut.TargetPath = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
} else {
    Write-Host "No Chrome-based browser found. Please install Chrome or Edge."
    exit
}

$Shortcut.Arguments = "--app=$appUrl"
$Shortcut.IconLocation = "$iconPath"
$Shortcut.Description = "Advanced ESP32 Web Flasher & Security Portfolio"
$Shortcut.Save()

Write-Host "Installation complete! A shortcut has been created on your desktop."
