"use strict";
const
    async=require("async"),
    file=require("file"),
    request=require("request"),
    rdfParser=require("./lib/rdf-parser.js"),
    work=async.queue(function(path,done){
        // this is the individual work
        rdfParser(path,function(err,doc){
            request({
                method:"PUT",
                url:"http://localhost:5984/books/"+doc._id,
                json:doc
            }, function(err,res,body){
                if(err){
                    throw Error(err)
                }
                console.log(res.statusCode,body);
                done();
            });
        });
    },10);
console.log("beginning directory walk");
file.walk(__dirname+"/cache",function(err,dirPath,dirs,files){
    // this pushes the individual work to the queue
    files.forEach(function(path){
        work.push(path);
    });
});