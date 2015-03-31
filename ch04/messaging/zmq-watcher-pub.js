"use strict";
const
    fs=require("fs"),
    zmq=require("zmq"),
    // creates publisher endpoint
    publisher=zmq.socket("pub"),
    filename=process.argv[2];
fs.watch(filename, function(){
    // sends message to any subscribers
    publisher.send(JSON.stringify({
        type:"changed",
        file:filename,
        timestamp:Date.now()
    }));
});
// listens on TCP port 5432
publisher.bind("tcp://*:5432",function(err){
    console.log("Listening for zmq subscribers... <3<3<3");
});