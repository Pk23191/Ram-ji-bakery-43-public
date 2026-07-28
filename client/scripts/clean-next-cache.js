const fs = require("fs");
const path = require("path");

const nextCache = path.join(__dirname, "..", ".next");

fs.rmSync(nextCache, { recursive: true, force: true });
