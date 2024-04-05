import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel'; // parser for javascript specifically
import { useRef } from 'react';
import './code-editor.css';

export interface CodeEditorProps {
    initialValue: string;
    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({onChange, initialValue}) => {
    const editorRef = useRef<any>(); // need to share editor between onEditorDidMount and formatCode

    const onEditorDidMount: EditorDidMount = (
        getValue, // function that returns a string
        monacoEditor // direct reference to the editor
    ) => {
        editorRef.current = monacoEditor;

        // This adds a change listener to the editor itself
        monacoEditor.onDidChangeModelContent(() => {
            onChange(getValue()); // this finally calls the onChange with the value currently in the editor
        });

        monacoEditor.getModel()?.updateOptions({ tabSize: 2 }); // shamelessly stole this - https://stackoverflow.com/questions/41107540/how-can-i-set-the-tab-width-in-a-monaco-editor-instance
    }

    const formatCode = () => {
        // get editor value
        const raw = editorRef.current.getModel().getValue();

        // format value
        const pretty = prettier.format(raw, 
            { 
                parser: 'babel', 
                plugins: [parser],
                tabWidth: 4,
                semi: true, // add semi colons
                singleQuote: true, // single quotes for strings, wherever possible
            }).replace(/\n$/, '');// remove newline character at end of file

        // return to editor
        editorRef.current.setValue(pretty);
    }

    return (
        <div className="editor-wrapper">
            <button 
                onClick={formatCode} 
                className="button button-format is-primary is-small"
            >
                Format
            </button>
            <MonacoEditor 
                editorDidMount={onEditorDidMount} // called whenever editor is shown on screen, using this to send the "onChange" callback through to this editor
                value={initialValue} // this is just the initial editor contents, doesn't work like a text editor (trust me this fooled me)
                language="javascript" 
                theme="dark" 
                height="100%" // ensures the editor obey's the resizable box's height
                options={{
                    wordWrap: 'on',
                    // the following settings are just to reclaim some space since I'm going to have this side by side with the preview
                    minimap: { enabled: false }, // remove minimap scrollbar on right
                    showUnused: false, // dont fade out unused imports
                    folding: false, // remove space on right side of line numbers
                    lineNumbersMinChars: 3, // reduce the amount of space used by the line numbers themselves
                    // fontSize: 16,
                    scrollBeyondLastLine: false,
                    automaticLayout: true, // make sure the editor updates on screen correctly when the user drags stuff around
                }}
            />
        </div>
    )
}

export default CodeEditor;