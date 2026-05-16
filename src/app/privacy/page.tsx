import type { Metadata } from "next";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import shell from "../_styles/shell.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — ClawCast",
  description:
    "How ClawCast collects, uses, and protects your data. Written in plain English.",
  openGraph: {
    title: "Privacy Policy — ClawCast",
    description:
      "How ClawCast collects, uses, and protects your data. Written in plain English.",
    type: "website",
  },
};

const LAST_UPDATED = "16 May 2026";

export default function Privacy() {
  return (
    <div className={shell.page}>
      <SiteHeader />

      <main>
        <section className={shell.hero}>
          <div className={shell.container}>
            <div className={shell.eyebrow}>Privacy</div>
            <h1 className={shell.heroHeadline}>
              Your data, in plain English.
            </h1>
            <p className={shell.heroSub}>
              ClawCast is built by a one-person team. There&rsquo;s no ad network, no
              tracking SDK, no data broker in the loop. This page explains exactly
              what we collect, why, and what you can do about it.
            </p>
            <div className={styles.lastUpdated}>Last updated: {LAST_UPDATED}</div>
          </div>
        </section>

        <div className={shell.divider} />

        <section className={shell.section}>
          <div className={shell.container}>
            <div className={styles.prose}>
              <div className={styles.tldr}>
                <h2>The short version</h2>
                <ul>
                  <li>
                    We collect what we need to make your personalized podcast: your
                    name and email (via Sign in with Apple), your content
                    preferences, swipe signals, and any newsletters you forward to
                    your private ClawCast alias.
                  </li>
                  <li>
                    Speech recognition runs on your device. Voice recordings never
                    leave your phone — only the transcript text is sent.
                  </li>
                  <li>
                    We don&rsquo;t sell your data, share it with advertisers, or use
                    it for tracking across other apps and websites.
                  </li>
                  <li>
                    You can delete your account and the personal data we hold
                    about you from inside the app (Settings &rarr; Delete
                    account), or by emailing{" "}
                    <a href="mailto:vincemartin1991@gmail.com">
                      vincemartin1991@gmail.com
                    </a>
                    .
                  </li>
                </ul>
              </div>

              <h2>1. Who we are</h2>
              <p>
                ClawCast is operated by <strong>Vince Martin</strong>, a sole
                proprietor based in Denmark. For the purposes of the EU General
                Data Protection Regulation (GDPR), Vince Martin is the{" "}
                <strong>data controller</strong> responsible for your personal
                data. You can reach the controller at{" "}
                <a href="mailto:vincemartin1991@gmail.com">
                  vincemartin1991@gmail.com
                </a>
                .
              </p>
              <p>
                This policy covers the ClawCast iOS app, the private RSS feeds we
                generate for listeners, and this website (
                <a href="https://theclawcast.com">theclawcast.com</a>).
              </p>

              <h2>2. What we collect</h2>

              <h3>Information you give us directly</h3>
              <ul>
                <li>
                  <strong>Sign in with Apple identifiers.</strong> When you sign
                  in, Apple sends us a stable user identifier (the &ldquo;Apple
                  subject&rdquo;), your name, and either your real email or
                  Apple&rsquo;s private relay email. You control which of those
                  you share.
                </li>
                <li>
                  <strong>Podcast preferences.</strong> The hosts, voices, tone,
                  duration, humor style, and any free-text guidance you write
                  (e.g. &ldquo;keep it light, no sports&rdquo;).
                </li>
                <li>
                  <strong>Source selections.</strong> Which newsletters,
                  publications, or custom RSS feeds you&rsquo;ve added to your
                  catalog.
                </li>
                <li>
                  <strong>Delivery schedule.</strong> What days and times you want
                  episodes delivered, plus your timezone.
                </li>
                <li>
                  <strong>Voice intake transcripts.</strong> If you complete the
                  voice onboarding step, your spoken brief is transcribed{" "}
                  <strong>on-device</strong> by iOS. The audio recording never
                  leaves your phone. The transcript text is sent to our server
                  and to OpenAI so we can extract the topics, names, and tone
                  notes that personalize your podcast — the resulting topics
                  and notes are stored, but the raw transcript itself is not
                  retained after extraction.
                </li>
                <li>
                  <strong>Feedback.</strong> Anything you type or dictate into the
                  in-app feedback form.
                </li>
                <li>
                  <strong>Optional weather location.</strong> If you turn on the
                  weather feature, your device&rsquo;s GPS coordinates are
                  reverse-geocoded <strong>on-device</strong> to a
                  &ldquo;City, Country&rdquo; string. Only that string is sent to
                  our servers; the raw coordinates are not.
                </li>
              </ul>

              <h3>Information we generate as you use the app</h3>
              <ul>
                <li>
                  <strong>Swipe signals.</strong> When you swipe right or left on
                  a story card, we record the direction, the article&rsquo;s title
                  and link, and a numerical embedding of its content. This is how
                  the app learns what you find interesting.
                </li>
                <li>
                  <strong>Episode and run history.</strong> Records of the
                  episodes we&rsquo;ve generated for you, when they were
                  delivered, and which source items they covered.
                </li>
                <li>
                  <strong>Newsletters forwarded to your alias.</strong> Each user
                  gets a private{" "}
                  <code>yourname@theclawcast.com</code> email alias. Newsletters
                  you forward (or that arrive via Substack subscriptions you set
                  up in the app) are stored as text so we can include them in
                  upcoming episodes. We store the subject, sender, plaintext body,
                  and any &ldquo;read on web&rdquo; link.
                </li>
                <li>
                  <strong>Substack subscription intents.</strong> When you tap
                  &ldquo;Subscribe&rdquo; on a publication inside the app, we
                  record the publication URL, title, and author so we can confirm
                  the subscription on your behalf.
                </li>
                <li>
                  <strong>Subscription and billing state.</strong> Your current
                  tier (Free, Pro, Max), product ID, renewal and expiry dates,
                  and the raw notifications Apple sends us when your subscription
                  changes.
                </li>
              </ul>

              <h3>What we do <em>not</em> collect</h3>
              <ul>
                <li>
                  We don&rsquo;t use any third-party analytics, advertising, or
                  attribution SDKs.
                </li>
                <li>
                  We don&rsquo;t collect device identifiers (no IDFA, no
                  identifierForVendor).
                </li>
                <li>
                  We don&rsquo;t collect your contact list, photos, browsing
                  history, or precise GPS location.
                </li>
                <li>
                  We don&rsquo;t collect payment card details. Apple handles all
                  payment processing inside the App Store — we only ever see the
                  subscription state Apple reports back to us.
                </li>
                <li>
                  Voice recordings from the microphone are never sent off your
                  device.
                </li>
              </ul>

              <h2>3. How we use it</h2>
              <ul>
                <li>
                  <strong>To make your podcast.</strong> Your preferences,
                  sources, swipes, forwarded newsletters, and (optionally) weather
                  city are used to generate the script and audio of each episode.
                </li>
                <li>
                  <strong>To deliver your podcast.</strong> Each user gets a
                  unique, token-gated RSS feed and audio URL. We use your account
                  identifiers to make sure only you can access your feed.
                </li>
                <li>
                  <strong>To manage your subscription.</strong> Your tier and
                  trial state determine which features you can use (premium
                  voices, weekly quotas, etc.).
                </li>
                <li>
                  <strong>To improve the app.</strong> Aggregated feedback and
                  error logs help us fix bugs and prioritize features. We don&rsquo;t
                  use any individual&rsquo;s data to build advertising profiles or
                  derive insights about you for any third party.
                </li>
                <li>
                  <strong>To prevent abuse.</strong> Authentication tokens, rate
                  limits, and subscription checks help us prevent fraud and keep
                  the service running.
                </li>
              </ul>

              <h2>4. Legal bases (for users in the EU/EEA/UK)</h2>
              <p>
                Under the GDPR, we rely on the following legal bases under
                Article 6:
              </p>
              <ul>
                <li>
                  <strong>Contract (Art. 6(1)(b)).</strong> Most of our
                  processing — generating and delivering your podcast,
                  authenticating you, managing your subscription — is necessary
                  to provide the service you signed up for.
                </li>
                <li>
                  <strong>Consent (Art. 6(1)(a)).</strong> The weather feature
                  uses your approximate location only after you explicitly turn it
                  on and grant the iOS location permission. You can withdraw
                  consent at any time by turning the feature off.
                </li>
                <li>
                  <strong>Legitimate interests (Art. 6(1)(f)).</strong> We rely on
                  legitimate interests for security monitoring, fraud prevention,
                  product improvement, and responding to your support requests.
                  These uses are limited and proportionate; you can object to them
                  at any time.
                </li>
                <li>
                  <strong>Legal obligation (Art. 6(1)(c)).</strong> Records
                  related to payments and tax may be retained as required by
                  Danish and EU law.
                </li>
              </ul>

              <h2>5. Who we share data with</h2>
              <p>
                We don&rsquo;t sell your data and we don&rsquo;t share it with
                advertisers or data brokers. We do use a small number of vetted
                service providers (&ldquo;sub-processors&rdquo;) to actually run
                the service. Each receives only the minimum data needed to do
                their job.
              </p>

              <table className={styles.subprocessorTable}>
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Purpose</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Apple</td>
                    <td>
                      Sign in with Apple, App Store payments, push notifications,
                      Apple Podcasts delivery
                    </td>
                    <td>EU + US</td>
                  </tr>
                  <tr>
                    <td>Google Cloud</td>
                    <td>
                      Hosting (Cloud Run), database (Firestore), audio storage
                      (Cloud Storage), secrets
                    </td>
                    <td>EU (europe-west1)</td>
                  </tr>
                  <tr>
                    <td>OpenAI</td>
                    <td>
                      Generating episode scripts and short summaries from the
                      sources you&rsquo;ve chosen
                    </td>
                    <td>US</td>
                  </tr>
                  <tr>
                    <td>ElevenLabs</td>
                    <td>Text-to-speech synthesis for premium-voice episodes</td>
                    <td>US</td>
                  </tr>
                  <tr>
                    <td>Mailgun</td>
                    <td>
                      Receiving newsletters at your private{" "}
                      <code>@theclawcast.com</code> alias
                    </td>
                    <td>EU</td>
                  </tr>
                </tbody>
              </table>

              <p>
                We may add or change sub-processors over time as the service
                evolves. Material changes will be reflected here.
              </p>

              <h2>6. International data transfers</h2>
              <p>
                Some of our sub-processors (notably OpenAI and ElevenLabs) are
                based in the United States. Where personal data is transferred
                outside the EU/EEA, we rely on the European Commission&rsquo;s
                Standard Contractual Clauses or equivalent safeguards provided by
                those vendors&rsquo; data processing agreements.
              </p>

              <h2>7. How long we keep your data</h2>
              <p>
                We keep your account data — profile, preferences, sources,
                episodes, swipe history, forwarded newsletters, and feedback —
                for as long as your account is active. We don&rsquo;t currently
                run automated retention or cleanup jobs against this data.
              </p>
              <p>
                When you delete your account (in-app, or by emailing us), we
                remove your personal data from our database and audio storage.
                Some records we&rsquo;re legally required to retain — chiefly
                payment and billing records, which under Danish bookkeeping
                rules must be kept for up to five years — will remain in a
                limited-access archive until that retention period ends, after
                which they are also deleted.
              </p>
              <p>
                Server logs (for security, debugging, and operational
                monitoring) are kept according to Google Cloud Logging&rsquo;s
                defaults — typically 30 days for standard logs, and up to 400
                days for security-relevant logs.
              </p>
              <p>
                If we introduce automated retention windows for things like
                old episodes or processed newsletter content in the future,
                we&rsquo;ll update this section before that change takes
                effect.
              </p>

              <h2>8. Your rights</h2>
              <p>
                If you&rsquo;re in the EU, EEA, or UK, the GDPR gives you the
                following rights. We honor the same rights for users elsewhere
                as a matter of policy.
              </p>
              <ul>
                <li>
                  <strong>Access.</strong> Request a copy of the personal data we
                  hold about you.
                </li>
                <li>
                  <strong>Rectification.</strong> Ask us to correct anything
                  that&rsquo;s wrong or incomplete.
                </li>
                <li>
                  <strong>Erasure.</strong> Delete your account from inside the
                  app (Settings &rarr; Delete account), or email us. Personal
                  data is removed promptly; billing records that we&rsquo;re
                  required by law to keep are retained for the legally
                  required period (see &ldquo;How long we keep your data&rdquo;).
                </li>
                <li>
                  <strong>Restriction and objection.</strong> Ask us to pause
                  certain processing, or object to processing based on legitimate
                  interests.
                </li>
                <li>
                  <strong>Portability.</strong> Receive your data in a
                  machine-readable format.
                </li>
                <li>
                  <strong>Withdraw consent.</strong> Turn off any feature you
                  previously opted into (e.g. weather).
                </li>
                <li>
                  <strong>Complain.</strong> Lodge a complaint with the Danish
                  Data Protection Agency (
                  <a href="https://www.datatilsynet.dk/english" target="_blank" rel="noopener noreferrer">
                    Datatilsynet
                  </a>
                  ) or your local supervisory authority.
                </li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:vincemartin1991@gmail.com">
                  vincemartin1991@gmail.com
                </a>
                . We&rsquo;ll respond within 30 days.
              </p>

              <h2>9. Security</h2>
              <p>
                Your data is stored on Google Cloud infrastructure in the
                europe-west1 region. We rely on Google&rsquo;s default
                encryption-at-rest and TLS in transit. Secrets (API keys, signing
                keys) live in Google Secret Manager and are not exposed to
                client-side code. Your podcast feed and audio URLs are gated by
                per-user tokens so they can&rsquo;t be guessed or shared
                accidentally.
              </p>
              <p>
                No system is perfectly secure. If we ever discover a breach that
                affects your data, we&rsquo;ll notify you and the relevant
                authorities as required by law.
              </p>

              <h2>10. Children</h2>
              <p>
                ClawCast is not directed to children under 16. We don&rsquo;t
                knowingly collect personal data from anyone under 16. If you
                believe a child has signed up, email us and we&rsquo;ll delete
                the account.
              </p>

              <h2>11. Changes to this policy</h2>
              <p>
                We may update this policy as the product changes. The &ldquo;Last
                updated&rdquo; date at the top of the page will reflect the most
                recent change. For material changes, we&rsquo;ll surface a notice
                inside the app before the change takes effect.
              </p>

              <h2>12. Contact</h2>
              <p>
                Questions, requests, or just curious? Email{" "}
                <a href="mailto:vincemartin1991@gmail.com">
                  vincemartin1991@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
