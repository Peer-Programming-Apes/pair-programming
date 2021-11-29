import React, { useEffect, useState } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';
import { CRDT, randomID, Char } from '../sequence-crdt/index'

export default function protosync() {
    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();
    const [crdtDoc, setCrdtDoc] = useState();



    function onMonacoChange(value, event) {
        // console.log(crdtDoc);
        // socket.emit('monaco change', value, event);
        console.log(value, event);
        if (event.changes[0].forceMoveMarkers) {
            console.log("forceMoveMarkers", event);
            return;
        }
        let text = event.changes[0].text;
        // console.log(text);
        let offset = event.changes[0].rangeOffset;
        let rangeLen = event.changes[0].rangeLength;
        let len = text.length;
        if (len == 0) {
            for (let i = 0; i < rangeLen; i++) {
                let char = crdtDoc.handleLocalDelete(offset);
                socket.emit('monaco change', char, "delete");
                console.log("crdt", crdtDoc.text);
            }
        }
        else {
            // console.log(event, text, len);
            for (let i = 0; i < len; i++) {
                let char = crdtDoc.handleLocalInsert(offset + i, text[i]);
                console.log("crdt", crdtDoc.text);
                // console.log(char);
                socket.emit('monaco change', char, "insert");
            }
        }

    };

    function onRemoteChange(char, action) {
        console.log(char);
        // console.log(crdtDoc);
        // console.log(socket);
        if (action == "insert")
            crdtDoc.handleRemoteInsert(char);
        else if (action == "delete")
            crdtDoc.handleRemoteDelete(char);
        console.log(crdtDoc.text);
        // console.log("check", editorValue === crdtDoc.text);
        setEditorValue(crdtDoc.text);
    }

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

        s.on('connect', () => {
            console.log("Connected!");

            const doc = new CRDT(randomID());
            // console.log("doc", doc);
            setCrdtDoc(doc);
            // TODO: fix koro
            // setEditorValue("");
        });
    }, []);

    useEffect(() => {
        console.log("crdtDoc changed", crdtDoc);
        if (crdtDoc && socket) {
            socket.on('monaco change', (char, action) => {
                onRemoteChange(char, action);
            });
        }
    }, [crdtDoc]);

    useEffect(() => {
        // console.log("Editor value changed", editorValue);
    }, [editorValue]);

    return (
        <div>
            <Monaco onChange={onMonacoChange} value={editorValue} />
        </div>
    )
}