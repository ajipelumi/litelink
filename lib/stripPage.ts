import * as cheerio from 'cheerio'

// Best-effort patterns for common ad/tracker containers. Not an adblock-list
// replacement — just enough to make the "lite" comparison meaningful for a
// typical content page, and honest about being heuristic rather than exhaustive.
const AD_TRACKER_HINTS = [
  'ad-', '-ad', 'ads-', '-ads', 'advert', 'sponsor', 'banner',
  'tracker', 'analytics', 'gtm-', 'doubleclick', 'outbrain', 'taboola',
]

function looksLikeAdOrTracker(value: string | undefined): boolean {
  if (!value) return false
  const v = value.toLowerCase()
  return AD_TRACKER_HINTS.some((hint) => v.includes(hint))
}

export function stripPage(html: string): string {
  const $ = cheerio.load(html)

  $('script, noscript, style, iframe, link[rel="preload"], link[rel="prefetch"]').remove()

  // Comments can carry old IE conditional cruft and are never rendered.
  $('*')
    .contents()
    .filter((_, node) => node.type === 'comment')
    .remove()

  $('[class], [id]').each((_, el) => {
    const node = $(el)
    const cls = node.attr('class')
    const id = node.attr('id')
    if (looksLikeAdOrTracker(cls) || looksLikeAdOrTracker(id)) {
      node.remove()
    }
  })

  // Keep <img src> so the lite page still shows images, but drop the heavy,
  // rarely-essential extras: responsive srcsets, base64 data URIs (these
  // inflate the HTML itself, sometimes by megabytes for a single icon), and
  // tracking-only data-* attributes.
  $('img').each((_, el) => {
    const node = $(el)
    node.removeAttr('srcset')
    node.removeAttr('sizes')
    const src = node.attr('src')
    if (src?.startsWith('data:')) {
      node.removeAttr('src')
    }
    for (const attr of Object.keys(el.attribs)) {
      if (attr.startsWith('data-') && attr !== 'data-src') {
        node.removeAttr(attr)
      }
    }
  })

  // Inline event handlers and style attributes are dead weight without the
  // stripped <script>/<style>, and onX handlers are also an XSS surface if
  // this HTML is ever rendered somewhere less carefully sandboxed.
  $('*').each((_, el) => {
    for (const attr of Object.keys(el.attribs)) {
      if (attr.startsWith('on')) $(el).removeAttr(attr)
    }
  })

  return $.html()
}

export function byteLength(input: string | Uint8Array): number {
  return typeof input === 'string' ? Buffer.byteLength(input, 'utf8') : input.byteLength
}
