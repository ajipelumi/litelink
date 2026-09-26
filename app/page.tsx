'use client'

import {useState} from 'react'

// PLACEHOLDER reference rate — not sourced from a real current bundle yet.
// Label this clearly as illustrative anywhere it is shown. Replace with a
// cited, current carrier rate before submission.
const NAIRA_PER_MB = 200

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/lite', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url: url.trim()}),
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">LiteLink</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Paste a link. See what it actually costs to load, and get a version
          without the ads, trackers, and dead weight.
        </p>
      </header>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/some-heavy-page"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {result && (
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Full page</div>
              <div className="mt-1 text-xl font-semibold">{formatKB(result.fullBytes)}</div>
              <div className="text-sm text-neutral-500">{formatNaira(result.fullBytes)} est.</div>
            </div>
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
              <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Lite page
              </div>
              <div className="mt-1 text-xl font-semibold">{formatKB(result.liteBytes)}</div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                {formatNaira(result.liteBytes)} est.
              </div>
            </div>
          </div>

          <p className="text-sm">
            <strong>{result.savedPercent}% smaller</strong> on a first, uncached
            load. This measures HTML weight after removing scripts, trackers,
            and unused images — not real-world network savings, which depend on
            caching and compression the browser already does.
          </p>

          <p className="text-xs text-neutral-500">
            Cost estimate uses a placeholder rate of ₦{NAIRA_PER_MB}/MB, for
            illustration only. Actual data prices vary by carrier and country.
          </p>

          <details className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <summary className="cursor-pointer text-sm font-medium">
              View lite version
            </summary>
            <iframe
              title="Lite version"
              srcDoc={result.liteHtml}
              sandbox="allow-same-origin"
              className="mt-3 h-[60vh] w-full rounded border border-neutral-200 dark:border-neutral-800"
            />
          </details>
        </section>
      )}
    </main>
  )
}
