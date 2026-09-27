'use client'

import {useState} from 'react'
import {AmbientBackground} from '@/components/AmbientBackground'
import {ThemeToggle} from '@/components/ThemeToggle'

const NAIRA_PER_MB = 4500 / (10 * 1024)
const RATE_SOURCE_DATE = 'September 2026'
const EXAMPLE_URL = 'https://www.premiumtimesng.com'

type Result = {
  url: string
  fullBytes: number
  liteBytes: number
  savedPercent: number
  liteHtml: string
}

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatNaira(bytes: number): string {
  const naira = (bytes / (1024 * 1024)) * NAIRA_PER_MB
  return `₦${naira.toFixed(naira < 10 ? 2 : 0)}`
}

export default function Page() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  async function check(target: string) {
    if (!target.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/lite', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url: target.trim()}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    check(url)
  }

  function tryExample() {
    setUrl(EXAMPLE_URL)
    check(EXAMPLE_URL)
  }

  function reset() {
    setUrl('')
    setError(null)
    setResult(null)
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      <section className="relative isolate overflow-hidden px-4 pb-14 pt-6 sm:pb-28 sm:pt-10">
        <AmbientBackground />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--color-background)] sm:h-32" />

        <div className="relative z-10 mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-sm font-medium tracking-wide text-[var(--color-text-secondary)]">
            LiteLink
          </span>
          <ThemeToggle />
        </div>

        <div className="relative z-10 mx-auto mt-6 flex max-w-2xl flex-col items-center text-center sm:mt-16">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text-secondary)] sm:text-6xl">
            See what a page
            <br />
            actually costs to load
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-text-primary)] sm:mt-5 sm:text-lg">
            Paste a link to see its full weight, then a stripped version
            with the ads, trackers, and dead weight gone, plus what each
            one costs in data.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-16 sm:-mt-16">
        <div className="gradient-shell rounded-2xl p-[1px] sm:rounded-full">
          <form
            onSubmit={submit}
            className="glass-surface flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] p-2 shadow-[var(--card-shadow)] sm:flex-row sm:rounded-full"
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL to check"
              className="min-w-0 flex-1 truncate rounded-xl bg-transparent px-4 py-2.5 text-sm text-[var(--color-text-secondary)] outline-none placeholder:text-[var(--color-text-primary)] sm:rounded-full"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-xl bg-[var(--color-text-secondary)] px-6 py-2.5 text-sm font-medium text-[var(--color-background)] transition-opacity duration-150 ease-out disabled:opacity-40 sm:rounded-full"
            >
              {loading ? 'Checking…' : 'Check'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={tryExample}
          disabled={loading}
          className="self-center text-xs font-medium text-[var(--color-text-primary)] underline decoration-dotted underline-offset-4 transition-colors duration-150 ease-out hover:text-[var(--color-primary)] disabled:opacity-40"
        >
          No link handy? Try an example: Premium Times Nigeria
        </button>

        {error && (
          <p className="rounded-[2px] border border-[var(--color-danger)] bg-[var(--color-danger-surface)] p-3 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        {result && (
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="glass-surface rounded-[2px] border border-[var(--color-border)] p-4 shadow-[var(--card-shadow)]">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-primary)]">
                  Full page
                </div>
                <div className="mt-1 text-xl font-semibold text-[var(--color-text-secondary)]">
                  {formatKB(result.fullBytes)}
                </div>
                <div className="text-sm text-[var(--color-text-primary)]">
                  {formatNaira(result.fullBytes)} est.
                </div>
              </div>
              <div className="rounded-[2px] border border-[var(--color-success)] bg-[var(--color-success-surface)] p-4 shadow-[var(--card-shadow)]">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-success)]">
                  Lite page
                </div>
                <div className="mt-1 text-xl font-semibold text-[var(--color-text-secondary)]">
                  {formatKB(result.liteBytes)}
                </div>
                <div className="text-sm text-[var(--color-success)]">
                  {formatNaira(result.liteBytes)} est.
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-primary)]">{result.savedPercent}% smaller</strong> on
              a first, uncached load. This measures HTML weight after removing
              scripts, trackers, and unused images. It isn&apos;t the same as
              real-world network savings, which also depend on caching and
              compression the browser already handles.
            </p>

            <p className="text-xs text-[var(--color-text-primary)]">
              Cost estimate is based on{' '}
              <a
                href="https://www.mtn.ng/data-plans-overview/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-dotted underline-offset-4 hover:text-[var(--color-primary)]"
              >
                MTN Nigeria&apos;s 10GB monthly plan
              </a>{' '}
              (₦4,500, or ₦{NAIRA_PER_MB.toFixed(2)}/MB) as of {RATE_SOURCE_DATE}.
              Actual rates vary by carrier, country, and plan size.
            </p>

            <details className="glass-surface rounded-[2px] border border-[var(--color-border)] p-3 shadow-[var(--card-shadow)]">
              <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-secondary)]">
                View lite version
              </summary>
              <iframe
                title="Lite version"
                srcDoc={result.liteHtml}
                sandbox="allow-same-origin"
                className="mt-3 h-[60vh] w-full rounded-[2px] border border-[var(--color-border)]"
              />
            </details>

            <button
              type="button"
              onClick={reset}
              className="self-start rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 ease-out hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              New check
            </button>
          </section>
        )}
      </section>

      <footer className="mx-auto w-full max-w-2xl px-4 pb-10 text-center text-xs text-[var(--color-text-primary)]">
        LiteLink fetches pages server-side to compare weight. It does not
        store the pages you check.
      </footer>
    </main>
  )
}
