import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    id: siteUrl,
    name: "PortfolioHub",
    short_name: "PortfolioHub",
    description: "Build, share, and install a modern engineering portfolio with chatbot, resume, and profile tools.",
    start_url: "/?utm_source=homescreen",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    categories: ["productivity", "developer", "business"],
    shortcuts: [
      {
        name: "Open Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/pwa-icons/192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Create Portfolio",
        short_name: "Create",
        url: "/auth",
        icons: [{ src: "/pwa-icons/512", sizes: "512x512", type: "image/png" }],
      },
      {
        name: "Demo Portfolio",
        short_name: "Demo",
        url: "/kunal",
        icons: [{ src: "/pwa-icons/monochrome-192", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "/pwa-icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icons/monochrome-192", sizes: "192x192", type: "image/png", purpose: "monochrome" },
    ],
    screenshots: [],
    share_target: {
      action: "/api/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
    protocol_handlers: [
      {
        protocol: "web+portfoliohub",
        url: "/open?target=%s",
      },
    ],
    launch_handler: {
      client_mode: "navigate-existing",
    },
  };
}