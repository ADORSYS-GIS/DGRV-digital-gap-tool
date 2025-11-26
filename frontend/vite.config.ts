import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8000,
    proxy: {
      "/realms": {
        target: "https://ec2-3-120-98-172.eu-central-1.compute.amazonaws.com/keycloak",
        changeOrigin: true,
        secure: false,
      },
      "/resources": {
        target: "https://ec2-3-120-98-172.eu-central-1.compute.amazonaws.com/keycloak",
        changeOrigin: true,
        secure: false,
      },
    },
    appType: "spa",
  },
  plugins: [
    react(),
    tsconfigPaths(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
}));
