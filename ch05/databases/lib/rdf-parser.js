/**
  * rdf-parser.js Module:
  * ====================
  * DESCRIPTION: Parses a rdf file and takes its basic structure in an object
  *              with fields:
  *                  _id: numerical string
  *                 title: string
  *                 authors: array
  *                 subjects: array
  *              This code is from  "Node.js the Right Way" (by
  *              Jim R. Wilson) chapter 5 with change in lines 41 and 42,
  *              including the use of .map(...).get() to get arrays
  *              https://pragprog.com/book/jwnode/node-js-the-right-way
  * EXPORT:      anonymous functions (filename,callback(err,parsedObject)).
  * MODIFY:      Loads the callback's second parameter.
  * USAGE:       ---
  *              const
  *                 parser=require("./lib/rdf-parser.js"),
  *              parser("the_rdf_file.rdf",function(err,parsedObject){
  *                // take actions for this reading
  *              });
  *              ---
  */
"use strict";
const
    fs=require("fs"),
    cheerio=require("cheerio");

module.exports=function(filename,callback){
    fs.readFile(filename,function(err,data){
        if(err){return callback(err);}
        let
            $=cheerio.load(data.toString()),
            collect=function(index,elem){
                return $(elem).text();
            },
            theObject={};

            callback(null,(theObject={
                _id:$("pgterms\\:ebook").attr("rdf:about").replace("ebooks/",""),
                title:$("dcterms\\:title").text(),
                authors:$("pgterms\\:agent pgterms\\:name").map(collect).get(),
                // subjects: $('[rdf\\:resource$="/LCSH"] ~ rdf\\:value').map( collect) // line *: it didn't work
                subjects:$("[rdf\\:resource$='/LCSH']").parent().find("rdf\\:value").map(collect).get() // replacement to line *
            }));
    });
};
