# README #

Learning to code for node.js, following advice from book [Node.js the Right Way: Practical, Server-Side JavaScript That Scales](https://pragprog.com/book/jwnode/node-js-the-right-way).
### Previous steps ###
Preparation of:

* cygwin environment for testing (make sure to include `curl` package)
* Be sure that `git` is installed and available from `%path%` environment variable (`$PATH` on cygwin)
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
```javascript
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
* Introduction to `cluster.fork()`, worker processes and communication from the master thread and 0MQ's interprocess communication (IPC). **(POSIX-like interprocess communication is not supported in Windows)**
* Introduction to PUSH/PULL bidirectional messaging and the first-joiner and limited-resource problems (without any programming but a very graphical illustration)
* Notes on error handling: in case of an error at fs.readFile, zmq-filer-rep.js should send an error event indicating the problem at reading the file's content or could wait until the file is available again using an internal structure of pending jobs. If it were a change on the protocol, it will communicate first if the client prefers to wait in case of error or immediately desist from the result
* Notes on robustness: the master should detect termination signals from the workers and replace one in case is terminated
* Notes on bidirectional messaging: nice homework!!!

### Chapter 5: Accessing Databases ###
About data persistence in databases and request to them, regarding asynchronous issues like overload of systems and how to mitigate these kind of problem and react to them.

* Usage of CouchDB (at (http://couchdb.apache.org/)) for exploring databases with Node, start to using "RESTful" practices
* Introduction to `package.json` file and `npm init` and `npm install --save <module>` and `npm install --save` and `npm install -g <module>` and `npm install`
* Implementing a parser to RDF files and finding out a solution ([described here](https://gist.github.com/alesscor/68cf26e74ddd1768b9b0#file-rdf-parser-js)) to the book's proposal which worked partially (perhaps due to its almost 2 years old implementation). Having read `cheerio.load(...).map(..)` [documentation](https://github.com/cheeriojs/cheerio#map-functionindex-element-) helped
* **Very important:** Overloading the operating system's services and implementing a queue-based solution
* In the importation example (the one that fails because overloading the server with so many requests), the database results for the REST command `GET http://localhost:5984/books` were:
```json
/* with a controlled pool of 1000 workers (too many request to my naive couchdb server) */
{
  "db_name":"books",
  "doc_count":2378,
  "doc_del_count":0,
  "update_seq":2378,
  "purge_seq":0,
  "compact_running":false,
  "disk_size":1871985,
  "data_size":754266,
  "instance_start_time":"1428080323340440",
  "disk_format_version":6,
  "committed_update_seq":2378
}

/* with a controlled pool of 10 workers */
{
  "db_name":"books",
  "doc_count":48625,
  "doc_del_count":0,
  "update_seq":48625,
  "purge_seq":0,
  "compact_running":false,
  "disk_size":127463537,
  "data_size":14924124,
  "instance_start_time":"1428079442778440",
  "disk_format_version":6,
  "committed_update_seq":48625
}
```
### Chapter 6: Scalable Web Servers ###

* Have to install `morgan` package because several functions become modularized for Express 4. Please refer to https://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0
* Introduction to *promises* using package `Q` by "kriskowal" (one full-featured promise library), which are objects that encapsulate results for asynchronous operations like the pair `(err, data)` in some callback functions. The promise will be resolved or rejected (success or error case managed with `resolve(...)` and `reject(...)` methods respectively). The function that handles each case is attached by the `then()`method
* "kriskowal"'s `Q` library also works on the browser's side, using the js library at (https://github.com/kriskowal/q)
* I had to use `taskkill /IM node.exe /F` in Windows to kill the "hello" example's service.
* I had to change express deprecated `res.json(status, obj)` into `res.status(status).json(obj)` on `lib\bundle.js`
* Introduction to generated RESTful APIs with Express <3<3<3 and modularization of functionality and dependencies management
* Introduction to generator functions with `function*(){...}` and `yield`, it allows communicate two portions of the code when convenient (two portions, specifically the generator function and the calling code)
* Introduction to a much more simplified way for calling promises combining `Q.denodify(...)`, `Q.async(...)` and declaration and immediate call of generator functions; very practical!! `denodify(...)` makes functions able to generate promises which are called in a unique generator function that manages the promises in benefit of code's flow, including the exception management. **The code looks synchronous but it's actually asynchronous being more organized**

### Chapter 7: Web Apps ###

* I had to install first `express-session` and `cookie-parser`, also had to download and install as a service [redis for Windows](https://github.com/MSOpenTech/redis/releases). [Redis](http://en.wikipedia.org/wiki/Redis) is an implementation for shared memory. The Redis for Windows' developers say *We strive to have a stable, functionally equivalent and comparably performing version of Redis on Windows. We have achieved performance nearly identical to the POSIX version running head-to-head on identical hardware across the network. Aside from feature differences that help Redis take advantage of the Windows infrastructure, our version of Redis should work in most situations with the identical setup and configuration that one would use on a POSIX operating system.* So it was installed as a service using `redis-server --service-install redis.windows.conf --loglevel verbose` on an command prompt run as administrator (**read the documentation**)
* It's needed to run `bower install` from Windows' console, it requires some user's data entry that didn't prompt on cygwin's terminal
* I had to correct the file `index.html` because `jquery.min.js` came inside `dist` directory: `<script src="jquery/dist/jquery.min.js"></script>`
* I went to [Google's projects console](https://console.developers.google.com/) to add a project and its respective basic information and get its respective client id and secret code
* The application's authentication strategy worked until April 20th, so I had to find another strategy: the recommended was `passport-google-oauth2` according to [this comment](https://github.com/jaredhanson/passport-google/issues/32#issuecomment-75877870)
* I had to `npm uninstall passport --save` and `npm install passport --save` to get this package's last version
* I had to `npm uninstall --save passport-google` and `npm install --save passport-google-oauth2` and modify `server.js` file because of this; and run `taskkill /IM node.exe /F` to restart the service
* I entered this [question/answer entry](http://stackoverflow.com/questions/30145592/node-js-passport-google-oauth2-delivers-failed-to-fetch-user-profile-error-i) to document the changes that resulted from changing the authentication package and the importance of enabling the `Google+ API` for the project at [Google's projects console](https://console.developers.google.com/)
