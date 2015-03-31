"use strict";
const
    fs=require("fs"),
    zmq=require("zmq"),
    // socket to reply to client requests
    responder=zmq.socket("rep");
    // handle incoming requests
    responder.on("message",function(data){
        /*
           the incoming
           requests are
           enqueued waiting
           to complete this
           event handling
        */
        // parse incoming message
        let request=JSON.parse(data);
        console.log("Received request to get:"+request.path);
        // read file and reply with content
        fs.readFile(request.path,function(err,content){
            console.log("Sending response content");
            responder.send(JSON.stringify({
                file:request.path,
                content:content.toString(),
                timestamp:Date.now(),
                pid:process.pid
            }));
        });
        console.log("Read was 'scheduled'");
    });
    // listen on TCP port 5433
    responder.bind("tcp://127.0.0.1:5433",function(err){
        console.log("Listening for zmq requesters...");
    });
    // close the responder when the Node process ends
    responder.on("SIGINT", function(err){
        console.log("Shutting down...");
        responder.close();
    });