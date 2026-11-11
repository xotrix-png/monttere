import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // iOS 15 Safari (iPhone 13's launch release) rejects newer syntax
    // and then never mounts React, which leaves only the navy page background.
    target: ["es2020", "safari14"],
  },
  server: {
    port: 5173,
    host: true,
  },
});
