import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";
import { produce } from "immer";

interface CellsState {
    loading: boolean;
    error: string | null;
    order: string[];
    data: {
        [key: string]: Cell
    }
}

const initialState: CellsState = {
    loading: false,
    error: null,
    order: [],
    data: {}
}

// More info on the 'produce' function and how to update patterns using immer: https://immerjs.github.io/immer/update-patterns
const reducer = produce((state: CellsState = initialState, action: Action): CellsState | void => {
    switch (action.type) {
        case ActionType.UPDATE_CELL:
            const { id, content } = action.payload;

            // no need to do this anymore, since we're using immer's 'produce' function
            // return {
            //     ...state,
            //     data: {
            //         ...state.data, 
            //         [id]: {
            //             ...state.data[id],
            //             content: content
            //         }
            //     }
            // }
            state.data[id].content = content;
            return state;

        case ActionType.DELETE_CELL:
            // delete cell from initialState.order
            state.order = state.order.filter(id => id !== action.payload);

            // delete cell from initialState.data
            delete state.data[action.payload];

            return state;

        case ActionType.MOVE_CELL:
            const { direction } = action.payload;
            const index = state.order.findIndex((id) => id === action.payload.id);
            const targetIndex = (direction === 'up') 
                ? index -1 
                : index + 1;
            
                // ensure new index is not out of bounds
            if (targetIndex < 0 || targetIndex > state.order.length -1) {
                return state;
            }

            state.order[index] = state.order[targetIndex];
            state.order[targetIndex] = action.payload.id;

            return state;

        case ActionType.INSERT_CELL_AFTER:
            const cell: Cell = {
                id: randomId(),
                type: action.payload.type,
                content: ''
            }

            state.data[cell.id] = cell;

            const foundIndex = state.order.findIndex(id => id === action.payload.id);
            // if the id isn't found inside the state object, add the new cell to the end
            if (foundIndex < 0) {
                state.order.unshift(cell.id);
            } else {
                state.order.splice(foundIndex+ 1, 0, cell.id);
            }
        
            return state;

        default:
            return state;
    }
}, initialState);

const randomId = () => {
    return Math.random().toString(36).substring(2, 8);
}

export default reducer;