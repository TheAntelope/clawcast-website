# clawcast-website

Marketing site for [ClawCast](https://github.com/TheAntelope) — a personal
podcast made from the news and writers you follow. Built with Next.js (App
Router, TypeScript) and styled directly off the brand's shared design tokens.

## Local development

```bash
git clone --recurse-submodules https://github.com/TheAntelope/clawcast-website.git
cd clawcast-website
npm install
npm run dev   # http://localhost:3000
```

If you forgot `--recurse-submodules`, run `git submodule update --init`
afterwards. Without the submodule, `globals.css` can't import the design
tokens and the build fails.

## Where the styling comes from

`design-tokens/` is a git submodule pointing at
[`TheAntelope/clawcast-tokens`](https://github.com/TheAntelope/clawcast-tokens).
That repo is the single source of truth for ClawCast's palette, spacing,
radii, and typography — it's also consumed by the iOS app, so brand changes
flow into both surfaces by editing one `tokens.json`.

The website pulls them in via:

```css
/* src/app/globals.css */
@import "../../design-tokens/dist/tokens.css";
```

Every brand value is then a CSS variable: `var(--color-amber)`,
`var(--spacing-l)`, `var(--typography-display-font-family)`, etc.

### Bumping tokens

1. Open the design-tokens submodule (`cd design-tokens`).
2. Edit `tokens.json`, run `npm run build` (regenerates `dist/tokens.css`).
3. Commit + push from inside the submodule (lands in `clawcast-tokens`).

That's it — the website's [`bump-tokens`](.github/workflows/bump-tokens.yml)
workflow runs hourly (08:00–23:00 UTC), notices the new `dist/tokens.css`,
fast-forwards the submodule pointer on `main`, and Vercel deploys. For an
instant bump, run the workflow manually from the Actions tab (or `gh
workflow run bump-tokens.yml`) instead of waiting for the next hour.

If you'd rather bump by hand: from the website root, `git add design-tokens
&& git commit && git push`. Vercel picks it up the same way.

## Deployment

Hosted on Vercel — pushes to `main` trigger production deploys, PRs get
preview URLs. The live site is [theclawcast.com](https://theclawcast.com)
(canonical is `www`; the apex 307-redirects to it). DNS is at GoDaddy;
Vercel handles certs.
