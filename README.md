# LiteLink

See what a page actually costs to load. Paste a URL, and LiteLink fetches it
server-side, strips scripts, trackers, and ad containers, and shows you the
before/after weight — plus an estimated data cost.

## How it works

1. You submit a URL from the browser.
2. The `/api/lite` route fetches it server-side (with an SSRF guard against
   localhost/private IP ranges and a hard byte cap), and reports the raw HTML
   size.
3. [`lib/stripPage.ts`](lib/stripPage.ts) parses the HTML with Cheerio and
   removes `<script>`, `<style>`, `<iframe>`, ad/tracker containers (by class
   or id heuristics), inline event handlers, image `srcset`/data URIs, and
   HTML comments.
4. The page shows both sizes side by side, the percentage saved, and an
   illustrative data-cost estimate (₦200/MB placeholder — not a real carrier
   rate).

The comparison measures HTML weight after stripping, not real-world network
transfer, which also depends on compression and caching the browser already
does.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- React 19, TypeScript, Tailwind CSS v4
- [Cheerio](https://cheerio.js.org) for HTML parsing
- Design tokens adapted from the Vectra Node design system
  ([`docs/design/vectra-node-design.md`](docs/design/vectra-node-design.md))

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

Runs the Vitest suite covering `lib/stripPage.ts` and `lib/safeFetch.ts`.

## Other scripts

```bash
npm run lint    # ESLint
npm run build   # Production build
npm start       # Serve the production build
```

## Deployment

Deployed on Vercel. `npm run build` followed by `vercel --prod` (or a push to
`main` with the Vercel GitHub integration) ships it.
