import React, { useEffect, useState } from 'react';
import Monaco from '../components/Monaco';
import { io, Socket } from 'socket.io-client';

export default function protosync() {
    const [socket, setSocket] = useState();
    const [editorValue, setEditorValue] = useState();

    function onMonacoChange(value, event) {
        socket.emit('monaco change', value, event);
    };

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

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
