import {assertSafeUrl, fetchCapped, UnsafeUrlError} from '@/lib/safeFetch'
import {byteLength, stripPage} from '@/lib/stripPage'

export const maxDuration = 30

export async function POST(req: Request) {
  let body: {url?: string}
  try {
    body = await req.json()
  } catch {
    return Response.json({error: 'Send { "url": "..." } as JSON.'}, {status: 400})
  }

  if (!body.url) {
    return Response.json({error: 'Missing "url".'}, {status: 400})
  }

  let target: URL
  try {
    target = assertSafeUrl(body.url)
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return Response.json({error: err.message}, {status: 400})
    }
    throw err
  }

  let bytes: Uint8Array
  let contentType: string | null
  try {
    ;({bytes, contentType} = await fetchCapped(target))
  } catch (err) {
    return Response.json(
      {error: err instanceof Error ? err.message : 'Could not fetch that URL.'},
      {status: 502},
    )
  }

  if (contentType && !contentType.includes('text/html')) {
    return Response.json({error: 'That URL is not an HTML page.'}, {status: 400})
  }

  const fullHtml = Buffer.from(bytes).toString('utf8')
  const fullBytes = byteLength(bytes)

  const liteHtml = stripPage(fullHtml)
  const liteBytes = byteLength(liteHtml)

  const savedPercent = fullBytes > 0 ? Math.round((1 - liteBytes / fullBytes) * 100) : 0

  return Response.json({
    url: target.toString(),
    fullBytes,
    liteBytes,
    savedPercent,
    liteHtml,
  })
}
