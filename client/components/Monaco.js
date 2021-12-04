import React from 'react';
import Editor from '@monaco-editor/react';


export default function Monaco(props) {
    
    return (
        <div>
            <Editor
                height="95vh"
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue=""
                onChange={props.onChange}
                value={props.value}
                onMount={props.onMount}
            />
        </div>
    )
}
