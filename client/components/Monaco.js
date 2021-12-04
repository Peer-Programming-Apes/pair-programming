import React, { Component, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';


export default function Monaco(props) {
    
    return (
        <div>
            <Editor
                height="95vh"
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue=""
                value={props.value}
                onMount={props.onMount}
            />
        </div>
    )
}
