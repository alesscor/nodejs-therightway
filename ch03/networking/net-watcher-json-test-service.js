"use strict";
const thePID=process.pid;
let theScript=[];
    console.log("The process PID: "+thePID+" running "+(theScript=process.argv[1].split("\\"))[theScript.length-1]);
const
    net=require("net"),
    server=net.createServer(function(connection){
        console.log("Subscriber connected.");
        // sends the first chunk immediately
        connection.write('{"type":"watching","file":"targ');

        // after a one second delay, send the other chunk
        let timer=setTimeout(function(){
            connection.write('et.txt","timestamp":1358175758495}'+"\n");
            connection.end();
        },1000);

        // clear timer when the connection ends
        connection.on("end",function(){
            // to assure the delay's action occurs once
            clearTimeout(timer);
            console.log("Subscriber disconnected.");
        });
    });
    server.listen(5432,function(){
        console.log("Test server listening for subscribers...");
    });