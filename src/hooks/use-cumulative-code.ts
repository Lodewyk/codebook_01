import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
    /**
     * This section joins together all the code that we have in this cell and the cells above
     * so that we can bundle it all together, allowing users to access code written in previous
     * cells.
     */
    return useTypedSelector((state) => {
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
                if (c.id === cellId) {
                    code.push(showFunc);
                } else {
                    code.push(showFuncNoOperation);
                }
                code.push(c.content);
            }

            // only cumulate up until the current cell
            if (c.id === cellId) {
                break;
            }
        }
        return code;
    }).join('\n');
}