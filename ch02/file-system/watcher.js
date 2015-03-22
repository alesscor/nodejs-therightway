const fs=require("fs");
fs.watch("target.txt",function(){
	console.log("File 'target.txt' just changed :-P");
});
console.log("Now watching target.txt for changes...");
