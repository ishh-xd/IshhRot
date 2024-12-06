#!/usr/bin/env node
const fs = require("fs");
const IshhrotInterpreter = require("../lib/interpreter");

const filePath = process.argv[2];
if (!filePath) {
    console.error("Usage: ishhrot <file.ir>");
    process.exit(1);
}

try {
    const code = fs.readFileSync(filePath, "utf-8");
    const interpreter = new IshhrotInterpreter();
    interpreter.execute(code);
} catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
}
