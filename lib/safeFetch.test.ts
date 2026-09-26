import {describe, expect, it} from 'vitest'
import {assertSafeUrl, UnsafeUrlError} from './safeFetch'

describe('assertSafeUrl', () => {
  it('accepts a normal https URL', () => {
    expect(assertSafeUrl('https://example.com').hostname).toBe('example.com')
  })

  it('accepts a normal http URL', () => {
    expect(assertSafeUrl('http://example.com').hostname).toBe('example.com')
  })

  it('rejects an invalid URL', () => {
    expect(() => assertSafeUrl('not a url')).toThrow(UnsafeUrlError)
  })

  it('rejects non-http(s) protocols', () => {
    expect(() => assertSafeUrl('ftp://example.com')).toThrow(UnsafeUrlError)
    expect(() => assertSafeUrl('file:///etc/passwd')).toThrow(UnsafeUrlError)
  })

  it('rejects localhost and loopback', () => {
    expect(() => assertSafeUrl('http://localhost')).toThrow(UnsafeUrlError)
    expect(() => assertSafeUrl('http://127.0.0.1')).toThrow(UnsafeUrlError)
  })

  it('rejects private IPv4 ranges', () => {
    expect(() => assertSafeUrl('http://10.0.0.5')).toThrow(UnsafeUrlError)
    expect(() => assertSafeUrl('http://192.168.1.1')).toThrow(UnsafeUrlError)
    expect(() => assertSafeUrl('http://172.16.0.1')).toThrow(UnsafeUrlError)
    expect(() => assertSafeUrl('http://169.254.0.1')).toThrow(UnsafeUrlError)
  })

  it('allows a public IP that only superficially resembles a private range', () => {
    expect(() => assertSafeUrl('http://172.32.0.1')).not.toThrow()
  })
})
