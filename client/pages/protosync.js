import React, { useEffect, useState, useRef } from 'react';
import Monaco from '../components/Monaco';
import { io } from 'socket.io-client';
import { CRDT, randomID, Char } from '../sequence-crdt/index'

const INSERT = 0;
const DELETE = 1;
const MONACO_CHANGES = "monaco changes";
const CRDT_INIT = "crdt init"
const EMIT_LIMIT = 1000;

export default function protosync() {
    const [isReady, setIsReady] = useState(false);

    const crdtRef = useRef(null)
    const socketRef = useRef(null)
    const editorRef = useRef(null);     // to store editor reference
    const toDisposeRef = useRef(null);  // to store Disposable reference for attached handler
    const cursorPositionRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://192.168.0.104:3001');

        socketRef.current.on('connect', () => {
            console.log("Connected!");

            // initialize crdt data structure and let monaco mount
            socketRef.current.on(CRDT_INIT, (changes) => {
                crdtRef.current = new CRDT(new randomID());
                onRemoteChange(changes);
                setIsReady(true);
            });

            socketRef.current.on(MONACO_CHANGES, onRemoteChange);

            socketRef.current.on('disconnect', (reason) => {
                console.log("disconnected", reason);
                setIsReady(false);
                editorRef.current = null;
                toDisposeRef.current = null;
                cursorPositionRef.current = null;
            });
        });

    }, []);

    function attachOnDidChangeContentHandler() {
        if (!editorRef.current) return;
        toDisposeRef.current = editorRef.current.getModel().onDidChangeContent(handleAndEmitUserChanges);
    }

    function detachOnDidChangeContentHandler() {
        if (!toDisposeRef.current) return;
        toDisposeRef.current.dispose();
        toDisposeRef.current = null;
    }

    // onMount handler
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;

        // change things about editor here:
        // changing EOL of editor to LF as CR causes loopback issues during remote insert
        editor.getModel().setEOL(0);

        // capture cursor positions
        editor.onDidChangeCursorPosition((e) => {
            cursorPositionRef.current = e;
        });

        attachOnDidChangeContentHandler();
    }
    

    function calculateCursorPosition(position, text, idx, isLineFeed, changeType) {
        console.log(position);
        let line = 1, col = 1;
        for (let i = 0; i < idx; i++) {
            if (text[i] == '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
        }
        console.log(line, col);
        if (isLineFeed) {
            if (changeType == INSERT) {
                console.log("LF I");
                if (line < position.lineNumber) {
                    position.lineNumber++;
                } else if (line == position.lineNumber && col < position.column) {
                    position.lineNumber++;
                    position.column -= (col - 1);
                }
            } else if (changeType == DELETE) {
                console.log("LF D");
                if (line < position.lineNumber - 1) {
                    position.lineNumber--;
                } else if (line == position.lineNumber - 1) {
                    position.lineNumber--;
                    position.column += (col - 1);
                }
            }
        } else {
            if (line == position.lineNumber && col < position.column) {
                if (changeType == INSERT) position.column++;
                else if (changeType == DELETE) position.column--;
            }
        }
        return position;
    }

    function setValue(value, idx, isLineFeed, changeType) {
        // do not do anythng if editor not mounted
        if (!editorRef.current) return;

        // detaching OnDidChangeContent handler to avoid reccursive changes
        detachOnDidChangeContentHandler();

        // storing the current cursor position
        // TODO: fix cursor position for same line changes
        const position = null;
        if (cursorPositionRef.current) 
            position = calculateCursorPosition(cursorPositionRef.current.position, value, idx, isLineFeed, changeType);

        editorRef.current.getModel().setValue(value);

        // set the cursor position
        if (position) editorRef.current.setPosition(position);

        // reattach the OnDidChangeContent handler
        attachOnDidChangeContentHandler();
    }


    // add changes to crdt, emit changes
    function handleAndEmitUserChanges(event) {
        let changes = [];

        for (let monacoChange of event.changes) {
            let text = monacoChange.text;
            let offset = monacoChange.rangeOffset;  // offset of changes
            let deleteCount = monacoChange.rangeLength;

            console.log("deleted " + deleteCount + " characters");
            // delete deleteCount characters starting from offSet!
            for (let i = 0; i < deleteCount; i++) {
                let char = crdtRef.current.handleLocalDelete(offset);
                changes.push({ char, type: DELETE });

                // limiting the number of changes per emit
                if (changes.length === EMIT_LIMIT) {
                    console.log("emitting " + changes.length + " changes");
                    socketRef.current.emit(MONACO_CHANGES, changes);
                    changes = [];
                }
            }

            console.log("inserted " + text.length + " characters");
            // insert all characters from text starting at offset
            for (let i = 0; i < text.length; i++) {
                let char = crdtRef.current.handleLocalInsert(offset + i, text[i]);
                changes.push({ char, type: INSERT });

                // limiting the number of changes per emit
                if (changes.length === EMIT_LIMIT) {
                    console.log("emitting " + changes.length + " changes");
                    socketRef.current.emit(MONACO_CHANGES, changes);
                    changes = [];
                }
            }
        }

        if (changes.length > 0) {
            console.log("emitting " + changes.length + " changes");
            socketRef.current.emit(MONACO_CHANGES, changes);
        }
    }

    // apply remote change and update value editor
    function onRemoteChange(changes) {
        console.log("received " + changes.length + " changes");

        for (let change of changes) {
            if (change.type === INSERT) {
                const idx = crdtRef.current.handleRemoteInsert(change.char);
                setValue(crdtRef.current.text, idx, change.char.value === "\n", change.type);

            }
            else if (change.type === DELETE) {
                const idx = crdtRef.current.handleRemoteDelete(change.char);
                setValue(crdtRef.current.text, idx, change.char.value === "\n", change.type);
            }
            else {
                console.log("invalid change.type", change);
            }
        }
        // setValue(crdtRef.current.text);
    }


    if (isReady) {
        return (
            <div>
                <Monaco value={crdtRef.current.text} onMount={handleEditorDidMount} />
            </div>
        )
    }
    else {
        return (
            <div>
                Trying to connect...
            </div>
        )
    }
}