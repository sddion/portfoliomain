export interface IDEFile {
    id: string
    name: string
    content: string
    isOpen: boolean
    isModified: boolean
    isFolder?: boolean
    parentId?: string | null
    language?: string
}

export interface IDESettings {
    board: string
    baudRate: number
    fontSize: number
    fontFamily: string
    verbose: boolean
    theme: string
    tabSize: number
    wordWrap: "on" | "off"
    minimap: boolean
    lineNumbers: "on" | "off"
}

export interface ArduinoLibrary {
    name: string
    version: string
    author: string
    description: string
    versions: string[]
    url: string
}


export interface BoardPlatform {
    id: string // e.g., "arduino:avr"
    name: string // "Arduino AVR Boards"
    version: string // Latest version
    versions: string[] // All available versions
    architecture: string
    installed: boolean
    description: string
    boards: { name: string, id: string }[] // List of board names in this platform
}
