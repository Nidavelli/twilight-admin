import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "./",
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "pages/*",
          dest: "pages",
        },
        {
          src: "favicon.ico",
          dest: ".",
        },
      ],
    }),
  ],
});
