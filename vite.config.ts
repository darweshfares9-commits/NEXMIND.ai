import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/start/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    tanstackStart({
      server: {
        entry: "server",
        preset: "vercel",
      },
    }),
  ],
});
