# README #

Learning to code for node.js, following advice from book [Node.js the Right Way: Practical, Server-Side JavaScript That Scales](https://pragprog.com/book/jwnode/node-js-the-right-way).
### Previous steps ###
Preparation of:

* cygwin environment for testing
* Download and installation of node.js version 0.10.20 (as recommended by the book)
* Preparation of this repository (synchronized using eclipse onboard git)

### Chapter 2: Wrangling the File System ###
First coding for node.js. 

* Use of --harmony (advanced functions not present in stable release 0.10.20)
* Use of constant and let
* Awareness of functions as first-class-citizens
* Use of modules (`fs`, `child_process`) and their methods
* Access to command line interface, including reading arguments and executing commands and getting output from them
* Use of spawn child process
* Use of events generated by `EventEmitter` classes like streams and standard output
* Use of callback functions to respond to events, including exceptions

Discussion on when to use synchronous methods:

* Think Node programs have two phases: (1) initialization phase for mission-critical tasks; (2) operation phase for I/O and interactivity
* Use synchronous methods in phase 1 and don't use them in phase 2. Example is the require function: which evaluates the target module's code and returns the module's object. This is done on the initialization phase.
* If you program can continue without the resource, get the resource asynchronously

### Chapter 3: Networking with Sockets  ###
More asynchronous programming and composition of custom modules :-D <3

* First using raw messages and then using structured protocol such as "Line-Delimited JSON" (LDJ), sending objects with `JSON.stringify(...)`
* First starting with naive server and client (the server ends with error if the client is ended although with telnet/putty client it wasn't a problem): message-boundary; 
* Then being more comprehensive with the different likely network events in client and server sides
* Use of testing program with `setTimeout()` and `clearTimeout()` to simulate the need of buffering data inputs
* Declaration and use of a **custom module** (LDJ buffering client module at `ldj.js`, called `LDJClient`) to buffer incoming data into messages, in this specific case using `EventEmitter`. An example of inheritance in JavaScript (used by node.js) is the following code listing.
```
#!javascript
/**
  * ldj.js Module:
  * ==============
  * DESCRIPTION: Event handler that appends raw `data` to the end
  *              of the buffer and so pulls completed messages.
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
      * RECEIVE:     stream that emits `data` events, such as a `Socket`
      *              connection.
      * RETURN:      LDJClient instance.
      * MODIFY:      Emission of "message" events.
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
            /** DESCRIPTION: Event handler that appends raw `data` to the end
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
    /* this associates EventEmitter prototype as LDJClient's prototypal parent;
       which  is a mechanism for JavaScript to look at EventEmitter the
       members it doesn't find looking at LDJClient */
    util.inherits(LDJClient,events.EventEmitter);
    // expose module methods by `exports` <3<3<3<3<3<3!!!
    exports.LDJClient=LDJClient;
    exports.connect=function(stream){
        /** DESCRIPTION:  Enables the creation of instances of LDJClient
          * RECEIVES      stream: the stream to be listen to to create
          *               the LDJClient instance
          * RETURN:       The LDJClient instance!!!
          * MODIFY:       Emission of event "messages" (refer to constructor :-))
          */
        return new LDJClient(stream);
    };
```
* Notes related to testability: How could it divide up and expose the functionality to make it more testable: the connection stream might be simulated by a file stream containing the sequence of messages that triggers the functionality
* Notes related to robustness: the client produces an error if the message is not a JSON string, case in which the client should disconnect and let know that the server is not running the expected protocol; LDJClient should emit other than `message` events like `nonLDJProtocol`, `serverTimeOut` and `fileNotAvailable` (if any of them were establish as new function). Several layers of communication can be implemented, each with a specific purpose.
* Notes related to separating concerns in LDJClient: it could be added an internal function (not needed to be exported) that reviews if the message is JSON-parsable. But having a separated module for this is not needed because the module is focused on JSON messages. If the protocols to support were more than one, another module dedicated to the protocols would be worth programmed. Regarding the multiple file watchers (understood as multiple processes that look at the file), it might be programmed a version with only a process watcher that communicates the changes to one server dedicated to notify messages to the multiple clients

### Chapter 4: Robust Messaging Services ###
Learning third-party modules!!! This is by writing robust messaging services in Node and concretely using Node's `cluster` to manage a pool of Node.js worker processes and messaging patterns (publish/subscribe, request/response, push/pull). It has an introduction to `npm`.

* Introduction to 0MQ (Zero-M-Q or `zmq`) for robust messaging services (first intall python, then python+zmq windows bundle gotten from https://github.com/zeromq/pyzmq/downloads, read http://zeromq.org/docs:windows-installations). As there was a problem at building it for `npm`, I followed the answer at [Node packages not building on Windows 8.1 - Missing Microsoft.Cpp.Default.props](http://stackoverflow.com/questions/21069699/node-packages-not-building-on-windows-8-1-missing-microsoft-cpp-default-props) and installed "Visual Studio Express 2013 for Windows Desktop" (with update 4 about 6GB :-S) and run `npm install zmq --msvs_version=2013` [as suggested here](http://stackoverflow.com/questions/14180012/npm-install-for-some-packages-sqlite3-socket-io-fail-with-error-msb8020-on-wi)
* Introduction to ROUTER/DEALER networking pattern and its parallelism and ZeroMQ Message Transport Protocol for exchanging messages with low overhead frames
* Introduction to `cluster.fork()`, worker processes and communication from the master thread