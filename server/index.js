import { Server } from "socket.io";
// import { CRDT, randomID, Char } from './sequence-crdt/index.mjs'

const INSERT = 0;
const DELETE = 1;
const MONACO_CHANGES = "monaco changes";

const io = new Server(3001, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.0.104:3000'],
    methods: ['GET', 'POST']
  }
});


io.on('connection', socket => {
  console.log(currTime(), "a usr connected");

  socket.on(MONACO_CHANGES, (changes) => {
    socket.broadcast.emit(MONACO_CHANGES, changes);
  });

  socket.on('disconnect', (reason) => {
    console.log(currTime(), "Disconnected due to", reason);
  });
});


function currTime() {
  let time = new Date();
  return "{" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]"
}