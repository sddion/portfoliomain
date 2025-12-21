import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
// @ts-ignore
import FS from '@isomorphic-git/lightning-fs'

let fsInstance: any = null

const getFS = () => {
    if (typeof window === 'undefined') return null
    if (!fsInstance) {
        fsInstance = new FS('ide-fs')
    }
    return fsInstance
}

// Helper to wipe the FS for a fresh start (optional, for testing)
export const wipeFS = async () => {
    const fs = getFS()
    if (!fs) return
    try {
        await fs.promises.rmdir('/', { recursive: true } as any)
    } catch (e) {
        console.warn("Wipe failed", e)
    }
}

export const GitService = {
    // Initialize repository
    init: async (dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        await git.init({
            fs,
            dir,
        })
        console.log("Git initialized")
    },

    // Write file to FS (bridge between React state and LightningFS)
    writeFile: async (filepath: string, content: string) => {
        const fs = getFS()
        if (!fs) return
        await fs.promises.writeFile(filepath, content, 'utf8')
    },

    // Read file from FS
    readFile: async (filepath: string) => {
        const fs = getFS()
        if (!fs) return ''
        return await fs.promises.readFile(filepath, 'utf8')
    },

    // Add file to staging
    add: async (filepath: string, dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        await git.add({
            fs,
            dir,
            filepath: filepath.startsWith('/') ? filepath.slice(1) : filepath
        })
    },

    // Commit changes
    commit: async (message: string, dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        // Must provide author info
        await git.commit({
            fs,
            dir,
            message,
            author: {
                name: 'User',
                email: 'user@example.com',
            },
        })
    },

    // Add remote
    addRemote: async (url: string, dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url,
            force: true
        })
    },

    // Push
    push: async (token: string, dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        await git.push({
            fs,
            http,
            dir,
            remote: 'origin',
            onAuth: () => ({ username: token }),
        })
    },

    // Pull
    pull: async (dir: string = '/') => {
        const fs = getFS()
        if (!fs) return
        await git.pull({
            fs,
            http,
            dir,
            singleBranch: true,
            author: {
                name: 'User',
                email: 'user@example.com',
            }
        })
    },

    // Get modified files (status)
    // Returns array of filepaths
    getModified: async (dir: string = '/') => {
        const fs = getFS()
        if (!fs) return []
        const matrix = await git.statusMatrix({
            fs,
            dir,
        })
        // Filter for modified (different from HEAD or index)
        // Matrix: [filepath, head, workdir, stage]
        
        return matrix
            .filter(row => row[1] !== row[2] || row[2] !== row[3])
            .map(row => row[0])
    }
}
