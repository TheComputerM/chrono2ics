import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";
import vercel from "vite-plugin-vercel";

export default defineConfig({
  plugins: [solid(), tsconfigPaths(), vercel()],
});
