// Copies the React build (dist/) into ../src/main/webapp so Eclipse's Tomcat serves the
// React app locally (run: npm run build:webapp, then restart Tomcat). These generated files
// are git-ignored; Docker builds its own copy. Only React-owned paths are touched: WEB-INF/
// and META-INF/ are never changed.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const webapp = join(root, '..', 'src', 'main', 'webapp')
const OWNED = ['index.html', 'favicon.svg', 'assets', 'models', 'draco', 'decor', 'brand', 'cuisines', 'confirmation', 'auth']

const unexpected = readdirSync(dist).filter((name) => !OWNED.includes(name) && !name.startsWith('.'))
if (unexpected.length) {
  console.error(`dist/ contains unexpected entries (${unexpected.join(', ')}); add them to OWNED and .gitignore first.`)
  process.exit(1)
}
for (const name of OWNED) {
  const target = join(webapp, name)
  if (existsSync(target)) rmSync(target, { recursive: true, force: true }) // drop old hashed files
  if (existsSync(join(dist, name))) cpSync(join(dist, name), target, { recursive: true })
}
console.log(`React build copied into src/main/webapp: ${OWNED.join(', ')}`)
