import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/bulbashky/",
  build: {
    outDir: "dist",
    rollupOptions: {
      // дві сторінки: фонова (створює пункт меню) і поповер (керування)
      input: {
        background: resolve(__dirname, "background.html"),
        index: resolve(__dirname, "index.html"),
      },
    },
  },
});
