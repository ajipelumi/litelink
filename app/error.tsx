'use client'

import {useEffect} from 'react'

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & {digest?: string}
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-danger)]">Error</p>
      <h1 className="text-2xl font-semibold text-[var(--color-text-secondary)]">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-text-primary)]">
        An unexpected error occurred. You can try again.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-2 rounded-full bg-[var(--color-text-secondary)] px-5 py-2 text-sm font-medium text-[var(--color-background)]"
      >
        Try again
      </button>
    </main>
  )
}
