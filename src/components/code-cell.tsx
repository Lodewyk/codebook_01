import { useState, useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import bundler from '../bundler';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';

interface CodeCellProps {
    cell: Cell
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
    const [code, setCode] = useState('');
    const [bundlingStatus, setBundlingStatus] = useState('');
    const { updateCell } = useActions();

    // this will ensure we only bundle if the user stops adding input for 1 second or longer
    useEffect(() => {
        const timer = setTimeout(async () => {
            const bundledOutput = await bundler(cell.content);
            setCode(bundledOutput.code);
            setBundlingStatus(bundledOutput.error)
        }, 1000); // update timer here if you want to bundle faster, this increases CPU usage, be aware

        return () => {
            clearTimeout(timer);
        }
    }, [cell.content]); // only runs when input changes

    return (
        <Resizable direction="vertical">
            <div style={{ height: 'calc(100% - 10px)', display: 'flex', flexDirection: 'row'}}>
                <Resizable direction="horizontal">
                    <CodeEditor 
                        initialValue={ (cell.content === '') ? "// Start adding code here!" : cell.content }
                        onChange={(value) => updateCell(cell.id, value)}
                    />
                </Resizable>
                <Preview code={code} bundlingError={bundlingStatus} />
            </div>
        </Resizable>
    );
}

export default CodeCell;