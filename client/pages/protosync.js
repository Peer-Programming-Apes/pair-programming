import React, { useEffect, useState, useRef } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';
import { CRDT, randomID, Char } from '../sequence-crdt/index'

export default function protosync() {
    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();   // dummy editor value
    const [_editorValue, _setEditorValue] = useState(); // actual editor value
    const [crdtDoc, setCrdtDoc] = useState();
    const [cursorPosition, setcursorPosition] = useState();
    const [lastCursorPosition, setLastCursorPosition] = useState();

    const editorRef = useRef(null);

    function ready() {
        if (crdtDoc &&
            editorRef && editorRef.current &&
            socket && socket.connected
        ) return true;
        else return false;
    }

    // onMount handler
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;

        // change things about editor here:
        // changing EOL of editor to LF as CR causes loopback issues during remote insert
        editor.getModel().setEOL(0);

        editor.onDidChangeCursorPosition((e) => {
            setcursorPosition(e);
        });
    }

    // handle change events of MonacoEditor
    function onMonacoChange(value, event) {

        // TODO check if everything is set up
        if (!ready()) {
            console.log("Not ready!");
            // handle being not ready!
            return;
        }

        // very basic; TODO: handle all types of event
        let text = event.changes[0].text;
        let offset = event.changes[0].rangeOffset;
        let rangeLen = event.changes[0].rangeLength;

        // delete rangeLen number of characters starting from offSet!
        for (let i = 0; i < rangeLen; i++) {
            let char = crdtDoc.handleLocalDelete(offset);
            socket.emit("monaco change", char, "delete");
        }

        // insert all characters from text starting at offset
        for (let i = 0; i < text.length; i++) {
            let char = crdtDoc.handleLocalInsert(offset + i, text[i]);
            socket.emit('monaco change', char, "insert");
        }
    };

    // apply remote change
    function onRemoteChange(char, action) {
        if (action == "insert") {
            crdtDoc.handleRemoteInsert(char);
        }
        else if (action == "delete") {
            crdtDoc.handleRemoteDelete(char);
        }
        setEditorValue(crdtDoc.text);
    }

    useEffect(() => {
        const s = io('http://192.168.0.104:3001');
        setSocket(s);

        s.on('connect', () => {
            console.log("Connected!");
            const doc = new CRDT(randomID());
            setCrdtDoc(doc);
        });
    }, []);

    useEffect(() => {
        // console.log("crdtDoc changed", crdtDoc);
        if (crdtDoc && socket) {
            socket.on('monaco change', onRemoteChange);
        }
    }, [crdtDoc]);

    useEffect(() => {
        setLastCursorPosition(cursorPosition);
        _setEditorValue(editorValue);
    }, [editorValue]);

    useEffect(() => {
        if (editorRef && lastCursorPosition) {
            editorRef.current.setPosition(lastCursorPosition.position);
        }
    }, [_editorValue]);


    return (
        <div>
            <Monaco onChange={onMonacoChange} value={_editorValue} onMount={handleEditorDidMount}/>
        </div>
    )
}


/*
    Extra code:

    // from onMonacoChange()
    // a "fix" for loopback issue caused by CR from CRLF EOL
    // no need to do this if setting EOF for the model
    // may cause unknown side effects!
    if (event.changes[0].forceMoveMarkers) {
        console.log("forceMoveMarkers", event);
        return;
    }



    useEffect(() => {
        console.log("useEffect:cursorPosition", cursorPosition);
    }, [cursorPosition]);

*/