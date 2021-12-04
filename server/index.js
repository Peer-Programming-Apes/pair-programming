import { Server } from "socket.io";
import { CRDT, randomID, Char } from './sequence-crdt/index.mjs'


const io = new Server(3001, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});


// maintaining a single document in memory
const doc = {
    crdt: null,
    allDeltas: [],
}

reset();

function initDoc() {
    let text = "";
    if (doc.crdt)
        text = doc.crdt.text;
    console.log(text);
    doc.crdt = new CRDT(new randomID);
    doc.allDeltas = [];
    for (let i = 0; i < text.length; i++) {
        const char = doc.crdt.handleLocalInsert(i, text[i]);
        doc.allDeltas.push({ char, action: "insert" });
    }
}

function reset() {
    console.log("reset!");
    io.removeAllListeners();

    initDoc();
    console.log(doc.crdt.text);
    console.log(doc.allDeltas.length);

    io.on('connection', socket => {

        console.log(currTime(), "a usr connected");

        // broadcast change to other connected users
        socket.on('monaco changes', (deltas) => {
            doc.allDeltas.push(...deltas);
            socket.broadcast.emit('monaco changes', deltas);

            for (let delta of deltas) {
                if (delta.action == "insert") {
                    doc.crdt.handleRemoteInsert(delta.char);
                }
                else if (delta.action == "delete") {
                    doc.crdt.handleRemoteDelete(delta.char);
                }
                else {
                    console.log("applyRemoteChanges(): delta.action invalid!", delta);
                }
            }
            console.log(doc.allDeltas.length);
        });

        socket.on('disconnect', (reason) => {
            console.log(currTime(), "Disconnected due to", reason);

            // all disconnected optimise
            if (io.of("/").sockets.size == 0)
                reset();
        });

        // on connection send over the current array of deltas
        socket.emit('monaco changes', doc.allDeltas);

    });

}

function currTime() {
    let time = new Date();
    return "{" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "]"
}