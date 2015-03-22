/*#!/usr/bin/bash /cygdrive/c/Program\ Files\ (x86)/nodejs/node.exe --harmony*/
fs=require("fs").createReadStream(process.argv[2]).pipe(process.stdout);
