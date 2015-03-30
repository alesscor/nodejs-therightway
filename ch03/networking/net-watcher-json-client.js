"use strict";
const thePID=process.pid;
let theScript=[];
    console.log("The process PID: "+thePID+" running "+(theScript=process.argv[1].split("\\"))[theScript.length-1]);
const
    net=require("net"),
    client=net.connect({port:5432});
    client.on("data",function(data){
        let message=JSON.parse(data);
        if(message.type==="watching"){
            console.log("Now watching: "+message.file);
        }else if(message.type==="changed"){
            let date=new Date(message.timestamp);
            // console.log("File '"+message.file+"' changed at "+date)
            console.log("File '"+message.file+"' changed at "+message.timestamp)
        }else{
            throw Error("Unreconized message type: "+message.type);
        }
    });
/*
3808->1300
5896->11064
*/