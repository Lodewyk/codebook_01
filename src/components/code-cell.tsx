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
    /**
     * This section joins together all the code that we have in this cell and the cells above
     * so that we can bundle it all together, allowing users to access code written in previous
     * cells.
     */
    const cumulativeCode = useTypedSelector((state) => {
        const { data, order } = state.cells;
        const orderedCells = order.map(id => data[id]);

        /**
         * This will be used to render the user code to the preview window
         * 
         * using 'var' for the declaration of show to allow us to declare it 
         * multiple times
         */
        const showFunc = `
            import _React from 'react';
            import _ReactDOM from 'react-dom';
            var show = (value) => {
                const root = document.querySelector('#root');
                if (typeof value === 'object') {
                    if (value.$$typeof && value.props) {
                        // render JSX component
                        _ReactDOM.render(value, root);
                    } else {
                        // render JS object
                        root.innerHTML = JSON.stringify(value);
                    }
                } else {
                    // render JS
                    root.innerHTML = value;
                }
            }
        `;
        const showFuncNoOperation = `var show = () => {}`;

        let code = [];
        for (let c of orderedCells) {
            if (c.type === 'code') {
                /**
                 * This if statement checks whether or not the id of the cell is the current id.
                 * if the cell we're cumulating is the current cell, we want to add the working 
                 * `show` function, otherwise we add the non-operational function. 
                 * This prevents code from previous cells where the show function is being called
                 * from being rendered in the preview window of a later cell, which is confusing.
                 */
                if (c.id === cell.id) {
                    code.push(showFunc);
                } else {
                    code.push(showFuncNoOperation);
                }
                code.push(c.content);
            }

            // only cumulate up until the current cell
            if (c.id === cell.id) {
                break;
            }
        }
        return code;
    });

    // this will ensure we only bundle if the user stops adding input for 1 second or longer
    useEffect(() => {
        /**
         * this if statement ensures that the preview window is displayed right away when
         * the page loads
         */
        if (!bundle) {
            createBundle(cell.id, cumulativeCode.join('\n'));
            return;
        }

        const timer = setTimeout(async () => {
            createBundle(cell.id, cumulativeCode.join('\n'));
        }, 1000); // update timer here if you want to bundle faster, this increases CPU usage, be aware

        return () => {
            clearTimeout(timer);
        }
        // ** IMPORTANT ** do not add 'bundle' in here or it causes an infinite loop of bundling
    }, [createBundle, cell.id, cumulativeCode.join('\n')]); // only runs when input changes

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