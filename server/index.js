import { Server } from "socket.io";
// import { CRDT, randomID, Char } from './sequence-crdt/index.mjs'

const io = new Server(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.0.104:3000'],
    methods: ['GET', 'POST']
  }
});


io.on('connection', socket => {
  console.log(currTime(), "a usr connected");

  socket.on('monaco change', (char, action) => {
    socket.broadcast.emit('monaco change', char, action);
  });

  socket.on('disconnect', (reason) => {
    console.log(currTime(), "Disconnected due to", reason);
  });
});


function currTime() {
  let time = new Date();
  return "{" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]"
}