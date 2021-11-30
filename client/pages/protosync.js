import React, { useEffect, useState, useRef } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';
import { CRDT, randomID, Char } from '../sequence-crdt/index'

export default function protosync() {
    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();
    const [crdtDoc, setCrdtDoc] = useState();

    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;     // get reference to edito
        // console.log("editor:", editor, "model:", editor.getModel());

        // change things about editor here:
        // changing EOL of editor to LF as CR causes loopback issues during remote insert
        editor.getModel().setEOL(0);
    }

    // handle change events of MonacoEditor
    function onMonacoChange(value, event) {
        console.log("onMonacoChange", value, event);

        // a "fix" for loopback issue caused by CR from CRLF EOL
        // no need to do this if setting EOF for the model
        // may cause unknown side effects!
        // if (event.changes[0].forceMoveMarkers) {
        //     console.log("forceMoveMarkers", event);
        //     return;
        // }

        // very basic; TODO: handle all types of event
        let text = event.changes[0].text;
        let offset = event.changes[0].rangeOffset;
        let rangeLen = event.changes[0].rangeLength;

        // delete rangeLen characters starting from offSet!
        for (let i = 0; i < rangeLen; i++) {
            let char = crdtDoc.handleLocalDelete(offset);
            socket.emit("monaco change", char, "delete");
            console.log("onMonacoChange:localDelete", crdtDoc.text);
        }

        // insert all characters from text starting at offset
        for (let i = 0; i < text.length; i++) {
            let char = crdtDoc.handleLocalInsert(offset + i, text[i]);
            socket.emit('monaco change', char, "insert");
            console.log("onMonacoChange:localInsert", crdtDoc.text);
        }

    };

    function onRemoteChange(char, action) {
        console.log("onRemoteChange", char, action);
        if (action == "insert")
            crdtDoc.handleRemoteInsert(char);
        else if (action == "delete")
            crdtDoc.handleRemoteDelete(char);

        setEditorValue(crdtDoc.text);
        console.log("onRemoteChange", crdtDoc.text);
    }

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

        s.on('connect', () => {
            console.log("Connected!");

            const doc = new CRDT(randomID());
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

    // useEffect(() => {
    //     console.log("useEffect:editorValue", editorValue);
    // }, [editorValue]);

    return (
        <div>
            <Monaco onChange={onMonacoChange} value={editorValue} onMount={handleEditorDidMount} />
        </div>
    )
}