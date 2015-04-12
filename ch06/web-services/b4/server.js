"use strict";
const
  express = require("express"),
  logger = require("morgan"),
  app = express();

app.use(logger("dev"));

const config = {
  bookdb: "http://localhost:5984/books/",
  b4db: "http://localhost:5984/b4/"
};

require("./lib/book-search.js")(config, app);
require("./lib/field-search.js")(config, app);
require("./lib/bundle.js")(config, app);

app.listen(3000, function(){
  console.log("ready captain.");
});
