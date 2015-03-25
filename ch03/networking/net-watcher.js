/*
"use strict";
const
    net=require("net"),
    server=net.createServer(function(connection){
        // use connection object for data transfer
    });
    server.listen(5432); // it binds the server to the TCP port
*/
"use strict";
const
    fs=require("fs"),
    net=require("net"),
    filename=process.argv[2],
    server=net.createServer(function(connection){
        // reporting
        console.log("Subscriber connected.");
        connection.write("Now watching '"+filename+"' for changes...\n");

        // watcher setup
        let watcher=fs.watch(filename,function(){
            connection.write("File '"+filename+"' changed: "+Date.now()+"\n");
        });

        // cleanup
        connection.on("close",function(){
            console.log("Subscriber disconnected.");
            watcher.close();
        });
    });
    if(!filename){
        throw Error("No target filename was specified!!!");
    }
    server.listen(5432,function(){
        console.log("Listening for subscribers...");
    });