// Profile page helpers: picture checks and resizing, and the same field rules as the backend
// (ProfileApi): name 2-100 characters, phone 10-14 digits (an optional +), address 5-255.

export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const AVATAR_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
const AVATAR_SIZE = 512 // stored square, in pixels: sharp in every place it is shown

const EXTENSIONS = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

/**
 * Checks the chosen file (JPG, PNG or WebP, at most 5 MB) and turns it into a 512 × 512
 * picture (centre square, WebP, or JPEG where the browser can't write WebP) ready to upload.
 * Throws an Error with a message for the user when the file can't be used.
 */
export async function prepareAvatar(file) {
  const extension = String(file.name || '').split('.').pop().toLowerCase()
  const type = file.type || EXTENSIONS[extension]
  if (!AVATAR_TYPES.includes(type) || !EXTENSIONS[extension]) {
    throw new Error('Please choose a JPG, PNG or WebP image.')
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error(`This picture is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please choose one under 5 MB.`)
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("We couldn't read this image. Please choose another one.")
  }
  const side = Math.min(bitmap.width, bitmap.height)
  const size = Math.min(AVATAR_SIZE, side)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d').drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close?.()

  const encode = (format) => new Promise((resolve) => canvas.toBlob(resolve, format, 0.9))
  let blob = await encode('image/webp')
  if (!blob || blob.type !== 'image/webp') blob = await encode('image/jpeg')
  if (!blob) throw new Error("We couldn't prepare this image. Please choose another one.")
  return blob
}

export const phoneDigits = (value) => String(value || '').replace(/[\s\-().]/g, '')

/** Field errors for the values being edited (only the fields present are checked). */
export function validateProfile(values) {
  const errors = {}
  if ('name' in values) {
    const name = values.name.trim().replace(/\s+/g, ' ')
    if (name.length < 2) errors.name = 'Please enter your full name.'
    else if (name.length > 100) errors.name = 'Your name can be at most 100 characters.'
  }
  if ('phone' in values && !/^\+?\d{10,14}$/.test(phoneDigits(values.phone))) {
    errors.phone = 'Please enter a valid phone number (10 to 14 digits).'
  }
  if ('address' in values) {
    const address = values.address.trim()
    if (address.length < 5) errors.address = 'Please enter your full address.'
    else if (address.length > 255) errors.address = 'Your address can be at most 255 characters.'
  }
  return errors
}

/** Which field a backend error message is about (for showing it under that field). */
export function fieldOf(message) {
  const text = String(message || '').toLowerCase()
  if (text.includes('name')) return 'name'
  if (text.includes('phone')) return 'phone'
  if (text.includes('address')) return 'address'
  return null
}
