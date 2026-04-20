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
        name: "Gap Assessment Tool",
        short_name: "GAT",
        description: "Cooperative Digital Transformation Tool",
        theme_color: "#ffffff",
        start_url: "/",
        scope: "/",
        display: "standalone",
        icons: [
          {
            src: "dgat-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "dgat-512-512.png",
            sizes: "512x512",
            type: "image/png",
          },
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
            urlPattern: /^https:\/\/158\.220\.84\.249\/backend\/.*/i,
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
            urlPattern: /^https:\/\/158\.220\.84\.249\/keycloak\/.*(openid-configuration|certs).*/i,
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
