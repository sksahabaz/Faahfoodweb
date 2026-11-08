const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Calls the Java /api servlets.
 * The backend only accepts writes with Content-Type: application/json,
 * so every non-GET request sends it, even without a body.
 */
export async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(API_BASE + path, {
    method,
    credentials: 'same-origin',
    headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Something went wrong. Please try again.', response.status)
  }
  return data
}
