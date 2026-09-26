import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-primary)]">404</p>
      <h1 className="text-2xl font-semibold text-[var(--color-text-secondary)]">
        This page doesn&apos;t exist
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-text-primary)]">
        LiteLink is a single-page tool. Head back and paste a URL to check.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-[var(--color-text-secondary)] px-5 py-2 text-sm font-medium text-[var(--color-background)]"
      >
        Back to LiteLink
      </Link>
    </main>
  )
}
