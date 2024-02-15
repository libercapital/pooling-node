import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  mode: "production",
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es", "cjs", "umd"],
      name: "main",
      fileName: (format) => `main.${format}.js`,
    },
    outDir: "lib",
    minify: true,
    copyPublicDir: false,
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [dts()],
});
