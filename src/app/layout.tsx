import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawCast — your unread newsletters, turned into your own morning show",
  description:
    "ClawCast turns the newsletters and writers you follow into a short podcast, hosted by AI voices, delivered to Apple Podcasts on your schedule. Live on iOS — free to try, with Pro and Max plans.",
  metadataBase: new URL("https://theclawcast.com"),
  openGraph: {
    title: "ClawCast",
    description:
      "Your unread newsletters, turned into your own morning show. Live on iOS — free to try.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawCast",
    description:
      "Your unread newsletters, turned into your own morning show. Live on iOS — free to try.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
