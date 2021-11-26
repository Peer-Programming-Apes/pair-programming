const io = require('socket.io')(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
    console.log(currTime() ,"a usr connected");
    

    socket.on('monaco change', (value, event) => {
      socket.broadcast.emit('monaco change', value, event);
    });
    

    socket.on('disconnect', (reason) => {
      console.log(currTime() ,"Disconnected due to", reason);
    });
});


function currTime() {
    let time = new Date();
    return "{" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]"
}