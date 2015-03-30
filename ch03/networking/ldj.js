/**
  * ldj.js Module:
  * ==============
  * DESCRIPTION: Event handler that append raw `data` to the end
  *              of the buffer and so pull completed messages.
  * EXPORT:      LDJClient `constructor()` and `connect()` functions.
  * MODIFY:      Emission of `message` events.
  * USAGE:       ---
  *              const
  *                 ldj=require("./ldj.js"),
  *                 client=ldj.connect(networkStream);
  *              client.on("message",function(message){
  *                // take actions for this message
  *              });
  *              ---
  */
"use strict";
const
    events=require("events"),
    util=require("util"),
    /**
      * DESCRIPTION: Constructor of LDJClient instances, inherites from
      *              EvenEmitter.
      * RECEIVE: stream that emits `data` events, such as a `Socket` connection.
      * RETURN: LDJClient instance.
      * MODIFY: Emission of "message" events.
      */
    LDJClient=function(stream){
        /* call to the EventEmitter on this, equivalent to calling super in
           other languages */
        events.EventEmitter.call(this);
        let
            /* declaration of `self` to regard disambiguation for future use
               of `this` */
            self=this,
            buffer="";
        stream.on("data",function(data){
            /** DESCRIPTION: Event handler that append raw `data` to the end
              *              of the buffer and so pull completed messages
              * RECEIVE:    data: low level source that forms \n-delimited
              *              messages. It supposes the messages are JSON.
              * RETURN: The instance with specific parent's prototype.
              * MODIFY: Emission of event "message" with a high level message.
              */
            buffer+=data;
            let boundary=buffer.indexOf("\n");
            while(boundary!==-1){
                let input=buffer.substr(0,boundary);
                buffer=buffer.substr(boundary+1);
                // the emission of message <3<3<3
                self.emit("message",JSON.parse(input));
                boundary=buffer.indexOf("\n");
            }
        });
    };
    /* associates EventEmitter prototype as LDJClient's prototypal parent;
       which  is a mechanism for JavaScript to look at EventEmitter the
       members it doesn't find looking at LDJClient */
    util.inherits(LDJClient,events.EventEmitter);
    // expose module methods by `exports` <3<3<3<3<3<3!!!
    exports.LDJClient=LDJClient;
    exports.connect=function(stream){
        /** DESCRIPTION:  Enable the creation of instances of LDJClient
          * RECEIVES      stream: the stream to be listen to to create
          *               the LDJClient instance
          * RETURN:       The LDJClient instance!!!
          * MODIFY:       Emission of event "messages" (refer to constructor :-))
          */
        return new LDJClient(stream);
    };
