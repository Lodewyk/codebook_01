import { ActionType } from "../action-types";
import { 
    Action,
    DeleteCellAction, 
    Direction, 
    InsertCellAfterAction, 
    MoveCellAction, 
    UpdateCellAction
} from "../actions";
import { CellTypes } from "../cell";
import { Dispatch } from 'redux';
import bundle from '../../bundler';

// TODO split action creators into separate files for cell actions / bundle actions and export from here

export const updateCell = (id: string, content: string): UpdateCellAction => {
    return {
        type: ActionType.UPDATE_CELL,
        payload: {
            id, 
            content
        }
    }
};

export const deleteCell = (id: string): DeleteCellAction => {
    return {
        type: ActionType.DELETE_CELL,
        payload: id
    }
};

export const moveCell = (id: string, direction: Direction): MoveCellAction => {
    return {
        type: ActionType.MOVE_CELL,
        payload: {
            id, 
            direction
        }
    }
};

export const insertCellAfter = (id: string | null, type: CellTypes): InsertCellAfterAction => {
    return {
        type: ActionType.INSERT_CELL_AFTER,
        payload: {
            id,
            type
        }
    }
};

export const createBundle = (cellId: string, userInput: string) => {
    return async (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.BUNDLE_START,
            payload: {
                cellId: cellId
            }
        });

        const result = await bundle(userInput);

        dispatch({
            type: ActionType.BUNDLE_COMPLETE,
            payload: {
                cellId,
                output: {
                    code: result.code,
                    error: result.error
                }
            }
        })
    }
}