const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1'])

// Private/loopback/link-local ranges. A URL resolving here should never be
// fetched server-side, since that would let anyone use this route to probe
// the deployment's own internal network.
const PRIVATE_IPV4_PATTERNS: RegExp[] = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
]

export class UnsafeUrlError extends Error {}

export function assertSafeUrl(rawUrl: string): URL {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UnsafeUrlError('Not a valid URL.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http and https URLs are supported.')
  }

  const hostname = url.hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError('That host cannot be fetched.')
  }
  if (PRIVATE_IPV4_PATTERNS.some((p) => p.test(hostname))) {
    throw new UnsafeUrlError('That host cannot be fetched.')
  }

  return url
}

const MAX_BYTES = 15 * 1024 * 1024

/**
 * Fetches a URL server-side with a hard byte cap, since the caller controls
 * the target and a multi-gigabyte response should not be read into memory.
 */
export async function fetchCapped(url: URL): Promise<{bytes: Uint8Array; contentType: string | null}> {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      // A generic desktop UA. Some sites serve a much lighter page to
      // unrecognised or bot-like clients, which would understate "full" size.
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    },
  })

  if (!res.ok) {
    throw new Error(`Upstream responded ${res.status}`)
  }

  const contentType = res.headers.get('content-type')
  const reader = res.body?.getReader()
  if (!reader) {
    const buf = new Uint8Array(await res.arrayBuffer())
    if (buf.byteLength > MAX_BYTES) throw new Error('Page too large to process.')
    return {bytes: buf, contentType}
  }

  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const {done, value} = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      await reader.cancel()
      throw new Error('Page too large to process.')
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return {bytes, contentType}
}
