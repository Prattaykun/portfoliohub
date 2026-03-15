import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const outputPath = process.env.ASSETLINKS_OUTPUT || path.join(repoRoot, "android-twa", "assetlinks.generated.json");
const packageName = process.env.ANDROID_APP_PACKAGE_ID;
const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS || "")
  .split(/[\n,;]+/)
  .map((value) => value.trim())
  .filter(Boolean);

if (!packageName || fingerprints.length === 0) {
  throw new Error("ANDROID_APP_PACKAGE_ID and ANDROID_SHA256_FINGERPRINTS are required to generate assetlinks.json.");
}

const assetLinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: packageName,
      sha256_cert_fingerprints: fingerprints,
    },
  },
];

await fs.writeFile(outputPath, JSON.stringify(assetLinks, null, 2));
console.log(`Generated ${outputPath}`);