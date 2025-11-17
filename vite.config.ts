import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Use 0.0.0.0 so the dev server is reachable from any local hostname/subdomain
    // (eg. classroom.localtest.me) and avoids IPv6 host resolution issues on some Windows setups.
    host: "0.0.0.0",
    port: 5173,
    // Let Vite infer the HMR host from the browser location (works with custom local hostnames).
    hmr: {
      protocol: "ws",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting for better caching and lazy loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          // Page chunks will be created automatically with lazy() imports
        },
      },
    },
    // Improve build performance
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
      },
    },
    // Optimize chunk size - Three.js is expected to be large
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    sourcemap: mode === "development",
    reportCompressedSize: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
    ],
  },
}));
