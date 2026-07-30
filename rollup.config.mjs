import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const cssFiles = [
  "01-foundations.css",
  "02-layout.css",
  "03-actions-and-surfaces.css",
  "04-content-and-forms.css",
  "05-feedback-and-docs.css",
  "06-advanced-components.css",
  "07-theme.css",
];

const assets = {
  name: "germinastack-assets",
  async buildStart() {
    await rm("dist", { recursive: true, force: true });
    await Promise.all([mkdir("dist/css", { recursive: true }), mkdir("dist/fonts", { recursive: true })]);
    await writeFile("dist/css/germinastack.css", (await Promise.all(cssFiles.map((file) => readFile(`src/css/${file}`, "utf8")))).join("\n"));
    await cp("src/fonts", "dist/fonts", { recursive: true });
    await copyFile("src/themes/product-themes.css", "dist/themes.css");
  },
};

export default {
  input: "src/index.js",
  output: [
    { file: "dist/js/germinastack.js", format: "umd", name: "GerminaStack" },
    { file: "dist/js/germinastack.mjs", format: "es" },
  ],
  plugins: [assets],
};
