import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: {
    // find: 해당 경로의 이름. 실제로 import문에 적용된다.
    // replacement: 경로 지정. 이때, path.resolve를 이용한다.
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      {
        find: "@app",
        replacement: path.resolve(__dirname, "src/app"),
      },
      {
        find: "@entities",
        replacement: path.resolve(__dirname, "src/entities"),
      },
      {
        find: "@features",
        replacement: path.resolve(__dirname, "src/features"),
      },
      {
        find: "@pages",
        replacement: path.resolve(__dirname, "src/pages"),
      },
      {
        find: "@shared",
        replacement: path.resolve(__dirname, "src/shared"),
      },
      {
        find: "@widgets",
        replacement: path.resolve(__dirname, "src/widgets"),
      },
    ],
  },
});
