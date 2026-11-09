import { useState } from 'react'
import { appUrl } from '@/lib/paths'

/** First letters of the first and last name ("SK Sahabaz" → "SS"), else the email's first letter. */
export function initialsOf(user, letters = 2) {
  const words = String(user?.name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length) return (words[0][0] + (letters > 1 && words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase()
  return String(user?.email || '?').charAt(0).toUpperCase()
}

/**
 * The user's profile picture (user.avatarUrl from GET /api/auth/me, the shared user query),
 * or their initials when there is none or it fails to load. Fills its parent, which sets the
 * size and shape; used by the navbar's account button (one letter, as before) and the
 * profile page (two).
 */
export default function UserAvatar({ user, letters = 2, className = '', textClassName = '' }) {
  const src = user?.avatarUrl ? appUrl(user.avatarUrl) : null
  const [failed, setFailed] = useState(null)
  if (src && failed !== src) {
    return <img src={src} alt="" className={`h-full w-full rounded-[inherit] object-cover ${className}`} onError={() => setFailed(src)} data-testid="avatar-image" />
  }
  return <span className={`grid h-full w-full place-items-center ${textClassName}`} data-testid="avatar-initials">{initialsOf(user, letters)}</span>
}
