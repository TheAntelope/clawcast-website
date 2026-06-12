// Single source of truth for the marketing site's product story. Every page,
// CTA, and meta tag should pull from here so the copy never drifts apart.
//
// ClawCast is LIVE on iOS, free to try, with paid Pro/Max plans. Android is in
// closed alpha (waitlist only). Apple Podcasts today; other players on the
// roadmap. Keep this file in sync with the App Store listing.

export const APP_STORE_URL =
  "https://apps.apple.com/app/theclawcast/id6762568729";

export const X_ACCOUNT_URL = "https://x.com/theclawcast_";

// Mention a free trial in copy ONLY when this is true (the 7-day Pro trial has
// actually shipped).
export const FREE_TRIAL_LIVE = false;

// Android is in closed alpha. The only Android CTA anywhere is this waitlist
// form — never a mailto.
// TODO: set the Android closed-alpha waitlist form URL (Tally/Typeform/etc.).
// While empty, the "On Android?" strip renders without a live link.
export const ANDROID_WAITLIST_FORM_URL = "";

export type Plan = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  featured?: boolean;
};

// Store prices are the source of truth, set via scripts/set_prices.py in the
// Newsletter-pod repo (App Store Connect + Google Play). These website strings are a
// MANUAL mirror — update them here whenever you run a price change, or they drift.
// Current values match the 2026-06-11 cut (Apple effective 2026-06-15).
export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "to start",
    blurb:
      "Generate and hear your own episode before you pay a cent. A real one, from your own sources.",
  },
  {
    name: "Pro",
    price: "$4.99",
    cadence: "/mo · $44.99/yr",
    blurb:
      "The full source catalog, episodes up to 20 minutes, and delivery every day of the week.",
    featured: true,
  },
  {
    name: "Max",
    price: "$7.49",
    cadence: "/mo · $66.99/yr",
    blurb:
      "Everything in Pro with the most headroom — for people who run several shows at once.",
  },
];
