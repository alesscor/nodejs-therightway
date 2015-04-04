/**
  * views.js Module:
  * ================
  * DESCRIPTION: Declares a set of objects with map-reduce functions.
  *              - The map functions emit keys for both autors and subjects.
  *              - The reduce functions refer to CouchDB's `_count` function.
  *              This code is from  "Node.js the Right Way" (by
  *              Jim R. Wilson) chapter 5
  *              https://pragprog.com/book/jwnode/node-js-the-right-way
  * EXPORT:      Object with mapreduce sub objects: by_author, by_subject
  * MODIFY:      Allows to emit authors and subjects per "document"
  * USAGE:       ---
  *              const
  *                 views=require("./lib/views.js"),
  *                // read the book's chapter 5 :-/
  *              ---
  */
"use strict";
module.exports={
    by_author:{
        map:function(doc){
            if("authors" in doc){
                doc.authors.forEach(emit);
            }
        }.toString(),
        reduce:"_count"
    },
    by_subject:{
        map:function(doc){
            if("subjects" in doc){
                doc.subjects.forEach(function(subject){
                    emit(subject,subject);
                    subject.split(/\s+--\s+/).forEach(function(part){
                        emit(part,subject);
                    });
                });
            }
        }.toString(),
        reduce:"_count"
    }
};