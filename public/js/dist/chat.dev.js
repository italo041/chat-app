"use strict";

var socket = io(); // elements

var $messageForm = document.querySelector('#message-form');
var $messageFormInput = $messageForm.querySelector('input');
var $messageFormButton = $messageForm.querySelector('button');
var $sendLocationButton = document.querySelector('#send-location');
var $messages = document.querySelector('#messages'); // Templates

var messageTemplate = document.querySelector('#message-template').innerHTML;
var locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
var sidebarTemplate = document.querySelector('#sidebar-template').innerHTML; // Options

var _Qs$parse = Qs.parse(location.search, {
  ignoreQueryPrefix: true
}),
    username = _Qs$parse.username,
    room = _Qs$parse.room;

var autoscroll = function autoscroll() {
  // New message element
  var $newMessage = $messages.lastElementChild; // Height of the new message

  var newMessageStyles = getComputedStyle($newMessage);
  var newMessageMargin = parseInt(newMessageStyles.marginBottom);
  var newMessageHeight = $newMessage.offsetHeight + newMessageMargin; //Visible Height

  var visibleHeight = $messages.offsetHeight; // Height of messages container

  var containerHeight = $messages.scrollHeight; // How far have i scrolled

  var scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', function (message) {
  var html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
socket.on('locationMessage', function (message) {
  var html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
socket.on('roomData', function (_ref) {
  var room = _ref.room,
      users = _ref.users;
  var html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users
  });
  document.querySelector('#sidebar').innerHTML = html;
});
$messageForm.addEventListener('submit', function (e) {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  var message = e.target.elements.message.value;
  socket.emit('sendMessage', message, function (error) {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered');
  });
});
$sendLocationButton.addEventListener('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(function (position) {
    var _position$coords = position.coords,
        latitude = _position$coords.latitude,
        longitude = _position$coords.longitude;
    socket.emit('sendLocation', {
      latitude: latitude,
      longitude: longitude
    }, function () {
      $sendLocationButton.removeAttribute('disabled');
      console.log("Location shared");
    });
  });
});
socket.emit('join', {
  username: username,
  room: room
}, function (error) {
  if (error) {
    alert(error);
    location.href = '/';
  }
});