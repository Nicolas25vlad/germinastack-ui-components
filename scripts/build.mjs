import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";

const cssFiles = [
  "01-foundations.css",
  "02-layout.css",
  "03-actions-and-surfaces.css",
  "04-content-and-forms.css",
  "05-feedback-and-docs.css",
  "06-advanced-components.css",
  "07-theme.css",
];

await mkdir("dist/css", { recursive: true });
await mkdir("dist/js", { recursive: true });
await writeFile("dist/css/germinastack.css", (await Promise.all(cssFiles.map((file) => readFile(`src/css/${file}`, "utf8")))).join(""));
await copyFile("src/js/germinastack.js", "dist/js/germinastack.js");
await copyFile("src/js/docs.js", "dist/js/docs.js");
