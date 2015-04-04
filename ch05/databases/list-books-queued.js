"use strict";
const
    async=require("async"),
    file=require("file"),
    rdfParser=require("./lib/rdf-parser.js"),
    work=async.queue(function(path,done){
        // this is the individual work
        rdfParser(path,function(err,doc){
            if(err){
                throw err;
            }else{
                console.log(doc);
                // this makes know the queue that the work is done
                done();
            }
        });
    },1000);
console.log("beginning directory walk");
file.walk(__dirname+"/cache",function(err,dirPath,dirs,files){
    // this pushes the individual work to the queue
    files.forEach(function(path){
        work.push(path);
    });
});