import React, { useEffect, useState, useRef } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';
import { CRDT, randomID, Char } from '../sequence-crdt/index'


const remoteDeltas = [];    // received deltas to be applied to crdt
let crdtDoc;


export default function protosync() {

    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();   // dummy editor value
    const [_editorValue, _setEditorValue] = useState(); // actual editor value
    const [cursorPosition, setcursorPosition] = useState();
    const [lastCursorPosition, setLastCursorPosition] = useState();
    const [isReady, setIsReady] = useState(false);

    const editorRef = useRef(null);

    // onMount handler
    function handleEditorDidMount(editor, monaco) {
        console.log("Mounted!");
        editorRef.current = editor;

        // change things about editor here:
        // changing EOL of editor to LF(0) as CR causes loopback issues during remote insert
        editor.getModel().setEOL(0);

        editor.onDidChangeCursorPosition((e) => {
            setcursorPosition(e);
        });
        

        applyRemoteChanges();
    }


    // handle change events of MonacoEditor
    function onMonacoChange(value, event) {
        console.log(event);
        // very basic; TODO: handle all types of event
        let text = event.changes[0].text;
        let offset = event.changes[0].rangeOffset;
        let rangeLen = event.changes[0].rangeLength;

        let deltas = [];
        // delete rangeLen number of characters starting from offSet!
        for (let i = 0; i < rangeLen; i++) {
            let char = crdtDoc.handleLocalDelete(offset);
            deltas.push({ char, action: "delete" });
            if (deltas.length == 1000) {
                socket.emit('monaco changes', deltas);
                console.log("emitting", deltas.length);
                deltas = [];
            }
        }

        // insert all characters from text starting at offset
        for (let i = 0; i < text.length; i++) {
            let char = crdtDoc.handleLocalInsert(offset + i, text[i]);
            deltas.push({ char, action: "insert" });
            if (deltas.length == 1000) {
                socket.emit('monaco changes', deltas);
                console.log("emitting", deltas.length);
                deltas = [];
            }
        }
        if (deltas.length > 0) {
            console.log("emitting", deltas.length);
            socket.emit('monaco changes', deltas);
        }
    };


    // apply remote change
    function applyRemoteChanges() {
        // check if editor has been mounted
        if (!editorRef.current) {
            console.log("applyRemoteChanges(): Editor not mounted!");
            return;
        }

        console.log("applyRemoteChanges()", remoteDeltas.length);
        for (let delta of remoteDeltas) {
            if (delta.action == "insert") {
                crdtDoc.handleRemoteInsert(delta.char);
            }
            else if (delta.action == "delete") {
                crdtDoc.handleRemoteDelete(delta.char);
            }
            else {
                console.log("applyRemoteChanges(): delta.action invalid!", delta);
            }
        }
        
        // remoteDeltas.length = 0;    // clear the array
        while(remoteDeltas.length > 0) {
            remoteDeltas.pop();
        }
        
        // console.log("applyRemoteChanges()", crdtDoc.text);
        setEditorValue(crdtDoc.text);
    }

    useEffect(() => {
        const s = io('http://localhost:3001');

        s.on('connect', () => {
            console.log("Connected!");
            crdtDoc = new CRDT(new randomID());

            s.on('monaco changes', (deltas) => {
                remoteDeltas.push(...deltas);
                applyRemoteChanges();
            });

            s.on('disconnect', (reason) => {
                console.log("disconnected", reason);
                setIsReady(false);
            });

            setIsReady(true);
        });

        // s.onAny((event, ...args) => {
        //     console.log("socket event", event, args);
        // });

        setSocket(s);

    }, []);

    // store last cursor position before updating editor
    // TODO: handle selections etc.
    useEffect(() => {
        setLastCursorPosition(cursorPosition);
        _setEditorValue(editorValue);
    }, [editorValue]);

    // update editor with new value
    useEffect(() => {
        if (editorRef && lastCursorPosition) {
            editorRef.current.setPosition(lastCursorPosition.position);
        }
    }, [_editorValue]);

    if (isReady)
        return (
            <div>
                <Monaco onChange={onMonacoChange} value={_editorValue} onMount={handleEditorDidMount} />
            </div>
        )
    else
        return (
            <div> Trying to connect... </div>
        )
}