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
            // next line is using formatting as suggested at http://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
            // connection.write("File '"+filename+"' changed: "+(new Date).toISOString().replace(/T/, ' ').substr(0, 19)+" GMT \n");
            // next code line was gotten from documentation, but it returned Central America was GMT-5 (�?):
            // File 'target.txt' changed: Sat Mar 28 2015 17:49:42 GMT-0500 (Central America Standard Time)
            connection.write("File '"+filename+"' changed: "+(new Date).toLocaleString()+"\n");
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