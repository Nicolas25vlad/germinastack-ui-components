import { cp } from "node:fs/promises";

const destination = process.argv[2] || "static/vendor/germinastack";
await cp(new URL("../dist/", import.meta.url), destination, { recursive: true, force: true });
