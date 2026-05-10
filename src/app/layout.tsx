import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawCast — your own podcast, made from the news you actually follow",
  description:
    "ClawCast turns the news and writers you actually follow into a short daily podcast, hosted by AI voices. Pick your sources, choose the hosts, and a new episode lands in Apple Podcasts on your schedule.",
  metadataBase: new URL("https://clawcast.com"),
  openGraph: {
    title: "ClawCast",
    description:
      "Your own podcast, hosted by AI voices, made from the news and writers you actually follow.",
    type: "website",
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
