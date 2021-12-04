import { useState, useRef, useEffect } from 'react'
import { Controlled as CEditor, UnControlled as UCEditor } from 'react-codemirror2'
import '../node_modules/codemirror/lib/codemirror.css'
import '../node_modules/codemirror/theme/material.css'


export default function CodeMirror(props) {
    const [value, setValue] = useState("nigga");
    const editorRef = useRef(null);

    useEffect(() => {
        console.log("useEffect: value changed", value);
    }, [value])

    return (
        <div>
            <CEditor
                value={value}
                options={{
                    lineNumbers: true,
                    theme: "material"
                }}
                onBeforeChange={(editor, data, value) => {
                    console.log("onBeforeChange", data, value);
                    setValue(value);
                }}
                onChange={(editor, data, value) => {
                    console.log("onChange", data, value);
                }}
                editorDidMount={editor => { editorRef.current = editor; }}
            />
        </div>


    )
}

// autoCursor={false}
/*

*/

/*
<UCEditor
    value={value}
    options={{
        theme: 'material',
        lineNumbers: true
    }}
    onChange={(editor, data, value) => {
        console.log("data", data);
        console.log("value", value);
    }}
    editorDidMount={editor => { editorRef.current = editor; }}
/>
*/