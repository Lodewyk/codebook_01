import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';
import { useTypedSelector } from '../hooks/use-typed-selector';
import './code-cell.css';

interface CodeCellProps {
    cell: Cell
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
    const { updateCell, createBundle } = useActions();
    const bundle = useTypedSelector((state) => state.bundles[cell.id]);

    // this will ensure we only bundle if the user stops adding input for 1 second or longer
    useEffect(() => {
        /**
         * this if statement ensures that the preview window is displayed right away when
         * the page loads
         */
        if (!bundle) {
            createBundle(cell.id, cell.content);
            return;
        }

        const timer = setTimeout(async () => {
            createBundle(cell.id, cell.content);
        }, 1000); // update timer here if you want to bundle faster, this increases CPU usage, be aware

        return () => {
            clearTimeout(timer);
        }
        // ** IMPORTANT ** do not add 'bundle' in here or it causes an infinite loop of bundling
    }, [createBundle, cell.id, cell.content]); // only runs when input changes

    return (
        <Resizable direction="vertical">
            <div style={{ height: 'calc(100% - 10px)', display: 'flex', flexDirection: 'row'}}>
                <Resizable direction="horizontal">
                    <CodeEditor 
                        initialValue={ (cell.content === '') ? "// Start adding code here!" : cell.content }
                        onChange={(value) => updateCell(cell.id, value)}
                    />
                </Resizable>
                {
                    !bundle || bundle.loading
                    ? <div className="progress-cover">
                            <progress className="progress is-small is-primary" max="100"></progress>
                        </div>
                    : <div className="progress-cover">
                    <progress className="progress is-small is-primary" max="100"></progress>
                </div>//<Preview code={bundle.code} bundlingError={bundle.error} />
                }
            </div>
        </Resizable>
    );
}

export default CodeCell;