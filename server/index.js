import { Server } from "socket.io";
import { CRDT, randomID, Char } from './sequence-crdt/index.mjs'

const INSERT = 0;
const DELETE = 1;
const MONACO_CHANGES = "monaco changes";
const CRDT_INIT = "crdt init"

const io = new Server(3001, {
    cors: {
        origin: ['http://localhost:3000', 'http://192.168.0.104:3000'],
        methods: ['GET', 'POST']
    }
});

let allChanges = [];
let crdtDoc = new CRDT(new randomID());

io.on('connection', socket => {
    console.log(currTime(), "a usr connected");
    console.log(allChanges.length);

    socket.on(MONACO_CHANGES, (changes) => {
        socket.broadcast.emit(MONACO_CHANGES, changes);
        for (let change of changes) {
            if (change.type === INSERT) {
                crdtDoc.handleRemoteInsert(change.char);
            }
            else if (change.type === DELETE) {
                crdtDoc.handleRemoteDelete(change.char);
            }
            else {
                console.log("invalid change.type", change);
            }
            allChanges.push(change);
        }
        console.log(allChanges.length);
    });

    socket.on('disconnect', (reason) => {
        console.log(currTime(), "Disconnected due to", reason);
        if (io.of("/").sockets.size === 0) {
            let text = crdtDoc.text;
            crdtDoc = new CRDT(new randomID);
            allChanges = [];

            for (let i = 0; i < text.length; i++) {
                const char = crdtDoc.handleLocalInsert(i, text[i]);
                allChanges.push({char, type: INSERT});
            }
        }
    });

    socket.emit(CRDT_INIT, allChanges);
});


function currTime() {
    let time = new Date();
    return "{" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]"
}