import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración estándar de Vite + React. Sin ajustes especiales:
// Vercel detecta este framework automáticamente (build: "vite build", output: "dist").
export default defineConfig({
  plugins: [react()],
});
