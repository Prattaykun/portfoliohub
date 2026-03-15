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
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    categories: ["productivity", "developer", "business"],
    shortcuts: [
      {
        name: "Open Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/favicon.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Create Portfolio",
        short_name: "Create",
        url: "/auth",
        icons: [{ src: "/favicon.png", sizes: "512x512", type: "image/png" }],
      },
      {
        name: "Demo Portfolio",
        short_name: "Demo",
        url: "/kunal",
        icons: [{ src: "/favicon.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "/favicon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.png", sizes: "192x192", type: "image/png", purpose: "monochrome" },
    ],
    screenshots: [
      {
        src: "/logo1.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
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