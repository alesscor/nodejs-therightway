"use strict";
const
    zmq=require("zmq"),
    filename=process.argv[2],
    // create the request endpoint
    requester=zmq.socket("req");
    // handle replies from responder
    requester.on("message",function(data){
        let response=JSON.parse(data);
        console.log("Received response:",response);
    });
    requester.connect("tcp://localhost:5433");
    // send request for content
    for(let i=1;i<=3;i++){
        /* sections 1 and 2 are asynchronous (natural in node.js): */
        /* section 1 */ console.log("Sending request "+i+" for '"+filename+"'");
        /* section 2 */ requester.send(JSON.stringify({
                        path:filename
                        }));
    }
