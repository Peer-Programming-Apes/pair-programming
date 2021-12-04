import React from "react";
// import CodeMirror from "../components/CodeMirror";

import dynamic from 'next/dynamic'

const CodeMirror = dynamic(() => import('../components/CodeMirror'), {
    ssr: false
})


export default function protosync() {
    return (
        <CodeMirror />
    )
}