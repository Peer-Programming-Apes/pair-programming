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
        // console.log(value, event);
        let text = event.changes[0].text;
        // console.log(text);
        let len = text.length;
        console.log(event, text, len);
        let offset = event.changes[0].rangeOffset;
        for (let i = 0; i < len; i++) {
            let char = crdtDoc.handleLocalInsert(offset + i, text[i]);
            console.log("crdt", crdtDoc.text);
            console.log(char);
            socket.emit('monaco change', char);
        }
    };

    function onRemoteChange(char) {
        console.log(char);
        // console.log(crdtDoc);
        // console.log(socket);
        crdtDoc.handleRemoteInsert(char);
        console.log(crdtDoc.text);
        for (let i = 0; i < crdtDoc.text.length; i++) {
            console.log(crdtDoc.text.charCodeAt(i));
        }
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
        })



    }, []);

    useEffect(() => {
        console.log("crdtDoc changed", crdtDoc);
        if (crdtDoc && socket) {
            socket.on('monaco change', (char) => {
                onRemoteChange(char);
            });
        }
    }, [crdtDoc]);
    
    useEffect(() => {
        console.log("Editor value changed", editorValue);
    }, [editorValue]);

    return (
        <div>
            <Monaco onChange={onMonacoChange} value={editorValue} />
        </div>
    )
}