import { useState, useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import bundler from '../bundler';
import Resizable from './resizable';

const CodeCell = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const [bundlingStatus, setBundlingStatus] = useState('');

    // this will ensure we only bundle if the user stops adding input for 1 second or longer
    useEffect(() => {
        const timer = setTimeout(async () => {
            const bundledOutput = await bundler(input);
            setCode(bundledOutput.code);
            setBundlingStatus(bundledOutput.error)
        }, 1000); // update timer here if you want to bundle faster, this increases CPU usage, be aware

        return () => {
            clearTimeout(timer);
        }
    }, [input]); // only runs when input changes

    return (
        <Resizable direction="vertical">
            <div style={{ height: '100%', display: 'flex', flexDirection: 'row'}}>
                <Resizable direction="horizontal">
                    <CodeEditor 
                        initialValue="// Start adding code here!" 
                        onChange={(value) => setInput(value)}
                    />
                </Resizable>
                <Preview code={code} bundlingError={bundlingStatus} />
            </div>
        </Resizable>
    );
}

export default CodeCell;