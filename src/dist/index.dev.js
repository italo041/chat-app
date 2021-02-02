"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var path = require('path');

var http = require('http');

var express = require('express');

var socketio = require('socket.io');

var Filter = require('bad-words');

var _require = require('./utils/messages'),
    generateMessage = _require.generateMessage,
    generateLocationMessage = _require.generateLocationMessage;

var _require2 = require('./utils/users'),
    addUser = _require2.addUser,
    removeUser = _require2.removeUser,
    getUser = _require2.getUser,
    getUserInRoom = _require2.getUserInRoom;

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var port = process.env.PORT || 3000;
var publicDirectoryPath = path.join(__dirname, '../public');
app.use(express["static"](publicDirectoryPath));
io.on('connection', function (socket) {
  console.log('New websocket connection');
  socket.on('join', function (options, callback) {
    var _addUser = addUser(_objectSpread({
      id: socket.id
    }, options)),
        error = _addUser.error,
        user = _addUser.user;

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', 'Welcome'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', "".concat(user.username, " has joined")));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    });
    callback();
  });
  socket.on('sendMessage', function (message, callback) {
    var user = getUser(socket.id);
    var filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });
  socket.on('sendLocation', function (coords, callback) {
    var user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, "https://google.com/maps?q=".concat(coords.latitude, ",").concat(coords.longitude)));
    callback();
  });
  socket.on('disconnect', function () {
    var user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', "".concat(user.username, " has left")));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      });
    }
  });
});
server.listen(port, function () {
  console.log("Server running on port ".concat(port));
});