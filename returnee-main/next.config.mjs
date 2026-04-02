import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Repo may live under Returnee_XRP/ with another lockfile at parent; keeps file tracing stable for Vercel.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
