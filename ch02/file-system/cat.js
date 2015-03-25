#!/usr/bin/env node --harmony
fs=require("fs").createReadStream(process.argv[2]).pipe(process.stdout);
