import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state';
import { useMemo } from 'react';

export const useActions = () => {
    const dispatch = useDispatch();

    /**
     * useMemo is like useState + useEffect put together
     * Whenever dispatch changes or if anything in the [dispatch] array changes,
     * react is going to rerun bindActionCreators and take the return value 
     * and provide it as the overall return from the useMemo hook.
     * 
     * This is only done the first time that we call useMemo and then again whenever something in the [dispatch] array changes.
     * 
     * This means we only attempt to bind our creators once, so that the useEffect method in code-cell.tsx doesn't call the useEffect
     * function over and over.
     * 
     * This comment is here to remind me why this is being done, this was ripped straight from a course and not my own creation
     */
    return useMemo(() => {
        return bindActionCreators(actionCreators, dispatch);
    }, [dispatch]);
}