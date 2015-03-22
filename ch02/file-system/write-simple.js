const fs=require("fs");
fs.writeFile("target.txt","una carajada",function(err){
    if(err){
        throw err;
    }
    console.log("file saved!!!! :-P");
});

