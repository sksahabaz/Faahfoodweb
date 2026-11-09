import { appUrl } from './paths'

// The approved FAah!! burger (Draco-compressed GLB from the FAah-Food-3D Blender project).
export const BURGER_MODEL_URL = appUrl('models/faah-burger.glb')

// Local copy of the Draco decoder that ships with three.js (scripts/copy-draco.mjs),
// so nothing is downloaded from a CDN and the decoder always matches three.js.
export const DRACO_DECODER_PATH = appUrl('draco/')

// Shown when WebGL is unavailable or the 3D scene fails.
export const FALLBACK_IMAGE = appUrl('brand/burger-fallback.webp')

// What the GLB contains (names and order from the Blender hierarchy).
export const ROOT_NAME = 'FAAH_BURGER'

// Decorative food sprites (public/decor).
export const decorUrl = (name) => appUrl(`decor/${name}.webp`)
