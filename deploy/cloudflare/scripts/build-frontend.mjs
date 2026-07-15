import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const cloudflareDir = resolve(currentDir, "..");
const repoRoot = resolve(cloudflareDir, "..", "..");
const frontendDir = resolve(repoRoot, "frontend");
const outDir = resolve(cloudflareDir, "dist");

const publicUrl = process.env.CLOUDFLARE_PUBLIC_URL?.trim();

if (!publicUrl) {
  console.error("CLOUDFLARE_PUBLIC_URL is required, for example https://webhook-inspector.example.com");
  process.exit(1);
}

const child = spawn(
  "npm",
  ["run", "build", "--", "--outDir", outDir],
  {
    cwd: frontendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_API_BASE_URL: publicUrl,
    },
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
