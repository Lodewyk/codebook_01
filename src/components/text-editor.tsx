import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect, useRef } from "react";
import './text-editor.css';
import { Cell } from "../state";
import { useActions } from "../hooks/use-actions";

interface TextEditorProps {
    cell: Cell
}

const TextEditor: React.FC<TextEditorProps> = ({ cell }) => {
    const mdEditorRef = useRef<HTMLDivElement | null>(null);
    const [editing, setEditing] = useState(false);
    const { updateCell } = useActions();

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
            <MDEditor 
                value={ (cell.content === '') ? '# ... Click here to start editing text' : cell.content } 
                onChange={(val) => updateCell(cell.id, val || '')} 
            />
        </div>
    } 

    return (
        <div className="text-editor card" onClick={() => setEditing(true)}>
            <div className="card-content">
                <MDEditor.Markdown source={ (cell.content === '') ? '# ... Click here to start editing text' : cell.content } />
            </div>
        </div>
    )
}

export default TextEditor;