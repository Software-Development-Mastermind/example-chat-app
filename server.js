const path = require('path');
const formatMessage = require('./utils/message');

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'client/build')));

io.on('connection', (socket) => {
  socket.on('joinChatroom', ({ username }) => {
    //emit to single user that is connecting
    socket.emit('msg', formatMessage(username, 'Welcome to chatroom'));

    //broadcast when new user connects >
    //emit to all user accept use that is connecting
    socket.broadcast.emit(
      'msg',
      formatMessage(username, 'User has join the chat')
    );
  });

  //broadcast to everybody
  //io.emit()

  //Catch event from the client
  //1. Runs when client disconnect
  socket.on('disconnect', () => {
    io.emit('msg', 'A user has left the chat');
  });

  //2. catch msg from the client
  socket.on('chatMsg', (msg) => {
    console.log(msg);
    io.emit('msg', msg);
  });
});

server.listen(port, () => console.log(`server started on port ${port}`));