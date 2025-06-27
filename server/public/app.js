const socket = io('ws://localhost:3500');

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');

document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);

msgInput.addEventListener('keypress', () => {
  if (nameInput.value && chatRoom.value) {
    socket.emit('activity', nameInput.value);
  }
});

function sendMessage(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const text = msgInput.value.trim();
  if (name && chatRoom.value && text) {
    socket.emit('message', { name, text });
    msgInput.value = "";
    msgInput.focus();
  }
}

function enterRoom(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const room = chatRoom.value.trim();
  if (name && room) {
    socket.emit('enterRoom', { name, room });
    chatDisplay.innerHTML = ""; // Clear old messages
  }
}

// Handle incoming messages
socket.on('message', ({ name, text, time }) => {
  activity.textContent = "";
  const li = document.createElement('li');
  li.className = 'post';

  if (name === nameInput.value) {
    li.classList.add('post--left');
  } else if (name !== 'Admin') {
    li.classList.add('post--right');
  }

  li.innerHTML = name !== 'Admin'
    ? `
      <div class='post__header ${name === nameInput.value ? 'post__header--user' : 'post__header--reply'}'>
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
      </div>
      <div class='post__text'>${text}</div>
    `
    : `<div class='post__text'>${text}</div>`;

  chatDisplay.appendChild(li);
  chatDisplay.scrollTop = chatDisplay.scrollHeight; // auto-scroll
});

// Typing indicator
let activityTimer;
socket.on('activity', (name) => {
  activity.textContent = `${name} is typing...`;
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 2000);
});

// User list update
socket.on('userList', ({ users }) => {
  showUsers(users);
});

// Room list update
socket.on('roomList', ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  usersList.innerHTML = '';
  if (users.length > 0) {
    const label = document.createElement('em');
    label.textContent = `Users in ${chatRoom.value}:`;
    usersList.appendChild(label);

    users.forEach((user, i) => {
      const span = document.createElement('span');
      span.textContent = ` ${user.name}${i < users.length - 1 ? ',' : ''}`;
      usersList.appendChild(span);
    });
  }
}

function showRooms(rooms) {
  roomList.innerHTML = '';
  if (rooms.length > 0) {
    const label = document.createElement('em');
    label.textContent = 'Active Rooms:';
    roomList.appendChild(label);

    rooms.forEach((room, i) => {
      const span = document.createElement('span');
      span.textContent = ` ${room}${i < rooms.length - 1 ? ',' : ''}`;
      roomList.appendChild(span);
    });
  }
}
