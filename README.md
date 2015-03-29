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
* Use of modules (fs, child_process) and their methods
* Access to command line interface, including reading arguments and executing commands and getting output from them
* Use of spawn child process
* Use of events generated by EventEmitter classes like streams and standard output
* Use of callback functions to respond to events, including exceptions

Discussion on when to use synchronous methods:

* Think Node programs have two phases: (1) initialization phase for mission-critical tasks; (2) operation phase for I/O and interactivity
* Use synchronous methods in phase 1 and don't use them in phase 2. Example is the require function: which evaluates the target module's code and returns the module's object. This is done on the initialization phase.
* If you program can continue without the resource, get the resource asynchronously

### Chapter 3: Networking with Sockets  ###
More asynchronous programming and composition of custom modules :-D <3

* First using raw messages and then using structured protocol such as "Line-Delimited JSON" (LDJ), sending objects with JSON.stringify(...)
* First starting with naive server and client (the server ends with error if the client is ended although with telnet/putty client it wasn't a problem)
* Then being more comprehensive with the different likely network events in client and server sides