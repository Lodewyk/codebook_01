import { useEffect } from 'react';
import CodeEditor from './code-editor';
import Preview from './preview';
import Resizable from './resizable';
import { Cell } from '../state';
import { useActions } from '../hooks/use-actions';
import { useTypedSelector } from '../hooks/use-typed-selector';
import './code-cell.css';
import { useCumulativeCode } from '../hooks/use-cumulative-code';

interface CodeCellProps {
    cell: Cell
}

const CodeCell: React.FC<CodeCellProps> = ({ cell }) => {
    const { updateCell, createBundle } = useActions();
    const bundle = useTypedSelector((state) => state.bundles[cell.id]);
    const cumulativeCode = useCumulativeCode(cell.id);

    // this will ensure we only bundle if the user stops adding input for 1 second or longer
    useEffect(() => {
        /**
         * this if statement ensures that the preview window is displayed right away when
         * the page loads
         */
        if (!bundle) {
            createBundle(cell.id, cumulativeCode);
            return;
        }

        const timer = setTimeout(async () => {
            createBundle(cell.id, cumulativeCode);
        }, 1000); // update timer here if you want to bundle faster, this increases CPU usage, be aware

        return () => {
            clearTimeout(timer);
        }
        // ** IMPORTANT ** do not add 'bundle' in here or it causes an infinite loop of bundling
    }, [createBundle, cell.id, cumulativeCode]); // only runs when input changes

    return (
        <Resizable direction="vertical">
            <div style={{ height: 'calc(100% - 10px)', display: 'flex', flexDirection: 'row'}}>
                <Resizable direction="horizontal">
                    <CodeEditor 
                        initialValue={ (cell.content === '') ? "// You can call a method called `show()` to render your code to the preview window" : cell.content }
                        onChange={(value) => updateCell(cell.id, value)}
                    />
                </Resizable>
                <div className="progress-wrapper">
                    {
                        !bundle || bundle.loading
                        ?   <div className="progress-cover">
                                <progress className="progress is-small is-primary" max="100"></progress>
                            </div>
                        :   <Preview code={bundle.code} bundlingError={bundle.error} />
                    }
                </div>
            </div>
        </Resizable>
    );
}

export default CodeCell;