// Copies the Draco decoder that ships with three.js into public/draco/ (git-ignored),
// so the decoder version always matches the installed three.js and nothing loads from a CDN.
// Runs automatically before `npm run dev` and `npm run build`.
import { cpSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco', 'gltf')
const target = join(root, 'public', 'draco')
mkdirSync(target, { recursive: true })
cpSync(source, target, { recursive: true })
console.log('Draco decoder copied to public/draco:', readdirSync(target).join(', '))
