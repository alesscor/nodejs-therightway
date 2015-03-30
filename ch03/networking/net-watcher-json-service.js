"use strict";
const thePID=process.pid;
let theScript=[];
    console.log("The process PID: "+thePID+" running "+(theScript=process.argv[1].split("\\"))[theScript.length-1]);
const
    fs=require("fs"),
    net=require("net"),
    filename=process.argv[2],
    server=net.createServer(function(connection){
        // reporting
        console.log("Subscriber connected.");
        // connection.write("Now watching '"+filename+"' for changes...\n");
        connection.write(JSON.stringify({
                        type:"watching",
                        file:filename
                    })+"\n");

        // watcher setup
        let watcher=fs.watch(filename,function(){
            // next line is using formatting as suggested at http://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
            // connection.write("File '"+filename+"' changed: "+(new Date).toISOString().replace(/T/, ' ').substr(0, 19)+" GMT \n");
            // next code line was gotten from documentation, but it returned Central America was GMT-5 (¿?):
            // File 'target.txt' changed: Sat Mar 28 2015 17:49:42 GMT-0500 (Central America Standard Time)
            // connection.write("File '"+filename+"' changed: "+(new Date).toLocaleString()+"\n");
            connection.write(JSON.stringify({
                            type:"changed",
                            file:filename,
                            // timestamp:(new Date).toLocaleString()
                            // time stamps is indeed more interesting here <3 <3 three times if file is edited in sublimetext
                            timestamp:Date.now()
                        })+"\n");
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