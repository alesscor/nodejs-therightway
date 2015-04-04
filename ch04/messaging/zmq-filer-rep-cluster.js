"use strict";
const
    cluster=require("cluster"),
    fs=require("fs"),
    zmq=require("zmq");

    if(cluster.isMaster){
        /* master process - creates ROUTER and DEALER sockets
           and binds endpoints */
        let
            router=zmq.socket("router").bind("tcp://127.0.0.1:5433"),
            dealer=zmq.socket("dealer").bind("tcp://127.0.0.1:5434"); // TCP for no IPC in Windows

        /* forwards messages between router and dealer */
        router.on("message",function(){
            let frames=Array.prototype.slice.call(arguments);
            dealer.send(frames);
        });

        dealer.on("message",function(){
            let frames=Array.prototype.slice.call(arguments);
            router.send(frames);
        });

        /* listens for workes to come online */
        cluster.on("online",function(worker){
            console.log("Worker "+worker.process.pid+" is online.");
        });

        /* fork three worker processes */
        for(let i=0;i<3;i++){
            cluster.fork();
        }

    }else{

        /* worker process - creates REP socket, connects to DEALER */
        let responder=zmq.socket("rep").connect("tcp://127.0.0.1:5434");

        responder.on("message",function(data){

            /* parse incoming message */
            let request=JSON.parse(data);
            console.log(process.pid+ " received request for: '"+request.path+"'");

            // read file and reply with content
            fs.readFile(request.path, function(err,data){
                console.log(process.pid+ " sending response")
                responder.send(JSON.stringify({
                    pid:process.pid,
                    data:data.toString(),
                    timestamp:Date.now()
                }));
            });

        });

    }
