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
4. Back in the website root, `git add design-tokens` to bump the submodule
   pointer, then commit. The next deploy picks up the new values.

## Deployment

Currently un-deployed. Static export works (`npm run build` produces a fully
static site), so any of Vercel / Netlify / Cloudflare Pages will work when
you're ready.
