import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect, useRef } from "react";
import './text-editor.css';

const TextEditor: React.FC = () => {
    const mdEditorRef = useRef<HTMLDivElement | null>(null);
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('# ...Click me to start editing text');

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            // make sure that the listener doesnt close the editor if the user is actually using it
            if (
                mdEditorRef.current 
                && event.target 
                && mdEditorRef.current.contains(event.target as Node)
            ) {
                console.log('element inside editor');
                return;
            }
            setEditing(false)
        }
        document.addEventListener('click', listener, { capture: true });

        // clean up function - ensures that the listener is removed if we ever stop showing this instance of this component on the screen.
        return () => {
            document.removeEventListener('click', listener, { capture: true });
        }
    }, []);

    if (editing) {
        return <div className="text-editor" ref={mdEditorRef}>
            <MDEditor value={value} onChange={(val) => setValue(val || '')} />
        </div>
    } 

    return (
        <div className="text-editor card" onClick={() => setEditing(true)}>
            <div className="card-content">
                <MDEditor.Markdown source={value} />
            </div>
        </div>
    )
}

export default TextEditor;