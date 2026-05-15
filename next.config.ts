import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Voice samples for ElevenLabs cloning are typically 1-5 minutes of audio,
      // which can exceed the 1MB default. 15MB covers a long sample with headroom.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
