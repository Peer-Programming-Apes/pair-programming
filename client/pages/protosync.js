import React, { useEffect, useState } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';
// import { CRDT, randomID, Char } from '../sequence-crdt/index'

export default function protosync() {
    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();
    const [crdtDoc, setCrdtDoc] = useState();

    function onMonacoChange(value, event) {
        socket.emit('monaco change', value, event);
        console.log(event);
    };

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

        s.on('connect', () => {
            console.log("Connected!");

            // const doc = new CRDT(randomID());
            // setCrdtDoc(doc);
            setEditorValue("");
        })

        s.on('monaco change', (value, event) => {
            setEditorValue(value);
        })
        
    }, []);

    return (
        <div>
            <Monaco onChange={onMonacoChange} value={editorValue}/>
        </div>
    )
}