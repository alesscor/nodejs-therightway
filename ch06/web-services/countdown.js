"use strict";
const
  // generator function
  countdown = function* (count) {
    while (count > 0) {
      console.log("carajada "+count);
      yield count;
      count -= 1;
    }
  },

  counter = countdown(5),

  callback = function(){
    let item = counter.next();
    if (!item.done) {
      console.log("carajada externa "+item.value);
      console.log(item.value);
      setTimeout(callback, 5000);
    }
  };
callback();

