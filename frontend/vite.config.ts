import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8000,
    proxy: {
      "/realms": {
        target:
          "https://ec2-3-120-98-172.eu-central-1.compute.amazonaws.com/keycloak",
        changeOrigin: true,
        secure: false,
      },
      "/resources": {
        target:
          "https://ec2-3-120-98-172.eu-central-1.compute.amazonaws.com/keycloak",
        changeOrigin: true,
        secure: false,
      },
    },
    appType: "spa",
  },
  base: "/",
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "DGAT – Digital Gap Analysis Tool",
        short_name: "DGAT",
        description: "Assess and close your cooperative's digital gaps with structured assessments and actionable recommendations.",
        theme_color: "#10b981",
        background_color: "#ffffff",
        start_url: "/",
        scope: "/",
        display: "standalone",
        icons: [
          { src: "icon-48x48.png", sizes: "48x48", type: "image/png" },
          { src: "icon-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "icon-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-192x192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icon-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Full path so Workbox resolves it correctly regardless of SW scope
        navigateFallback: "/index.html",
        // Don't intercept API, backend, or Keycloak requests with the SW
        navigateFallbackDenylist: [/^\/api\//, /^\/backend\//, /^\/keycloak\//],
        maximumFileSizeToCacheInBytes: 4000000,
        // Ensure the SW claims all clients immediately on first install
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Cache backend API responses so they're readable offline
            urlPattern: /^https:\/\/app\.decidel\.app\/backend\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Keycloak's OIDC discovery/config endpoint
            urlPattern: /^https:\/\/app\.decidel\.app\/keycloak\/.*(openid-configuration|certs).*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "keycloak-config-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
}));
