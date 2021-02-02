"use strict";

var generateMessage = function generateMessage(username, text) {
  return {
    username: username,
    text: text,
    createdAt: new Date().getTime()
  };
};

var generateLocationMessage = function generateLocationMessage(username, url) {
  return {
    username: username,
    url: url,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage: generateMessage,
  generateLocationMessage: generateLocationMessage
};