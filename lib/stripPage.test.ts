import {describe, expect, it} from 'vitest'
import {byteLength, stripPage} from './stripPage'

describe('stripPage', () => {
  it('removes script, style, and iframe tags', () => {
    const html = '<html><body><script>evil()</script><style>.x{}</style><iframe src="x"></iframe><p>hi</p></body></html>'
    const out = stripPage(html)
    expect(out).not.toContain('<script')
    expect(out).not.toContain('<style')
    expect(out).not.toContain('<iframe')
    expect(out).toContain('hi')
  })

  it('removes elements that look like ads or trackers by class or id', () => {
    const html = '<div class="ad-banner">buy now</div><div id="analytics-widget">x</div><p>content</p>'
    const out = stripPage(html)
    expect(out).not.toContain('buy now')
    expect(out).not.toContain('analytics-widget')
    expect(out).toContain('content')
  })

  it('strips srcset, data URIs, and tracking data attributes from images, keeping src', () => {
    const html = '<img src="https://x.com/a.png" srcset="a 1x, b 2x" data-tracking-id="123" data-src="keep">'
    const out = stripPage(html)
    expect(out).toContain('src="https://x.com/a.png"')
    expect(out).not.toContain('srcset')
    expect(out).not.toContain('data-tracking-id')
    expect(out).toContain('data-src')
  })

  it('drops data: URI image sources', () => {
    const html = '<img src="data:image/png;base64,AAAA">'
    const out = stripPage(html)
    expect(out).not.toContain('data:image')
  })

  it('removes inline event handler attributes', () => {
    const html = '<button onclick="doEvil()">Click</button>'
    const out = stripPage(html)
    expect(out).not.toContain('onclick')
    expect(out).toContain('Click')
  })

  it('removes HTML comments', () => {
    const html = '<p><!-- old IE conditional --></p>'
    const out = stripPage(html)
    expect(out).not.toContain('old IE conditional')
  })
})

describe('byteLength', () => {
  it('measures a UTF-8 string in bytes, not characters', () => {
    expect(byteLength('abc')).toBe(3)
    expect(byteLength('é')).toBe(2)
  })

  it('measures a Uint8Array by its length', () => {
    expect(byteLength(new Uint8Array([1, 2, 3, 4]))).toBe(4)
  })
})
