import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Optimize",
    short_name: "Optimize",
    description: "A calm life assistant for planning, meals, nudges, reflections, and progress.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f4ec",
    theme_color: "#2f4b43",
    orientation: "portrait",
    categories: ["productivity", "lifestyle", "health"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/maskable-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
