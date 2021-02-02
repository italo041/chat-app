"use strict";

var users = [];

var addUser = function addUser(_ref) {
  var id = _ref.id,
      username = _ref.username,
      room = _ref.room;
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase(); // Validate the data

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  } // Check for existing user


  var existingUser = users.find(function (user) {
    return user.room === room && user.username === username;
  }); //Validate username

  if (existingUser) {
    return {
      error: 'Username is in use'
    };
  } // Store user


  var user = {
    id: id,
    username: username,
    room: room
  };
  users.push(user);
  return {
    user: user
  };
};

var removeUser = function removeUser(id) {
  var index = users.findIndex(function (user) {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

var getUser = function getUser(id) {
  var user = users.find(function (user) {
    return user.id === id;
  });

  if (!user) {
    return undefined;
  }

  return user;
};

var getUserInRoom = function getUserInRoom(room) {
  room = room.trim().toLowerCase();
  var usersInRoom = users.filter(function (user) {
    return user.room === room;
  });

  if (!room) {
    return [];
  }

  return usersInRoom;
};

module.exports = {
  addUser: addUser,
  removeUser: removeUser,
  getUser: getUser,
  getUserInRoom: getUserInRoom
};