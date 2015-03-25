const
    fs=require("fs"),
    data=fs.readFileSync("target.txt"); // this waits for the buffer to have all the file's data
  process.stdout.write(data.toString());