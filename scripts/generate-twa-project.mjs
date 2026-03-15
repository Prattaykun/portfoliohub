import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ConsoleLog, TwaGenerator, TwaManifest } from "@bubblewrap/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const androidDir = path.join(repoRoot, "android-twa");

const appUrl = process.env.PWA_APP_URL || "https://portfoliohub-pi.vercel.app";
const manifestUrl = new URL("/manifest.webmanifest", appUrl).toString();
const host = new URL(appUrl).host;
const packageId = process.env.ANDROID_APP_PACKAGE_ID || "app.portfoliohub.twa";
const keystorePath = process.env.ANDROID_KEYSTORE_PATH || path.join(androidDir, "android-keystore", "upload-keystore.jks");
const keyAlias = process.env.ANDROID_KEY_ALIAS || "upload";
const appVersion = process.env.ANDROID_APP_VERSION || process.env.npm_package_version || "1.0.0";
const versionCode = Number(process.env.ANDROID_VERSION_CODE || "1");

const twaManifest = new TwaManifest({
  packageId,
  host,
  name: process.env.ANDROID_APP_NAME || "PortfolioHub",
  launcherName: process.env.ANDROID_LAUNCHER_NAME || "PortfolioHub",
  display: "standalone",
  themeColor: "#0f172a",
  themeColorDark: "#020617",
  navigationColor: "#0f172a",
  navigationColorDark: "#020617",
  navigationDividerColor: "#020617",
  navigationDividerColorDark: "#020617",
  backgroundColor: "#0f172a",
  startUrl: process.env.ANDROID_START_URL || "/?utm_source=twa",
  iconUrl: new URL("/pwa-icons/512", appUrl).toString(),
  maskableIconUrl: new URL("/pwa-icons/maskable-512", appUrl).toString(),
  monochromeIconUrl: new URL("/pwa-icons/monochrome-192", appUrl).toString(),
  orientation: "portrait",
  appVersion,
  appVersionCode: versionCode,
  signingKey: {
    path: keystorePath,
    alias: keyAlias,
  },
  enableNotifications: true,
  webManifestUrl: manifestUrl,
  fallbackType: "customtabs",
  enableSiteSettingsShortcut: true,
  shortcuts: [
    {
      name: "Open Dashboard",
      shortName: "Dashboard",
      url: new URL("/dashboard", appUrl).toString(),
      chosenIconUrl: new URL("/pwa-icons/192", appUrl).toString(),
    },
    {
      name: "Create Portfolio",
      shortName: "Create",
      url: new URL("/auth", appUrl).toString(),
      chosenIconUrl: new URL("/pwa-icons/512", appUrl).toString(),
    },
  ],
  shareTarget: {
    action: new URL("/api/share-target", appUrl).toString(),
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      title: "title",
      text: "text",
      url: "url",
    },
  },
  protocolHandlers: [
    {
      protocol: "web+portfoliohub",
      url: new URL("/open?target=%s", appUrl).toString(),
    },
  ],
  fullScopeUrl: `${appUrl.replace(/\/$/, "")}/`,
  generatorApp: "portfoliohub-ci",
});

const validationError = twaManifest.validate();
if (validationError) {
  throw new Error(`Invalid TWA manifest: ${validationError}`);
}

await fs.rm(androidDir, { recursive: true, force: true });
await fs.mkdir(path.join(androidDir, "android-keystore"), { recursive: true });

const generator = new TwaGenerator();
const log = new ConsoleLog("twa-generator");

await twaManifest.saveToFile(path.join(androidDir, "twa-manifest.json"));
await generator.createTwaProject(androidDir, twaManifest, log);

const manifestBuffer = await fs.readFile(path.join(androidDir, "twa-manifest.json"));
const checksum = crypto.createHash("sha256").update(manifestBuffer).digest("hex");
await fs.writeFile(path.join(androidDir, "manifest-checksum.txt"), checksum);

console.log(`Generated Bubblewrap project in ${androidDir}`);