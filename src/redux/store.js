import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useAppDispatch, useSelector as useAppSelector } from 'react-redux';// react binding for redux
import { rootReducer } from './rootReducer';

// create store
const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
    }) // function that can run in between writing and reading from our store
});

const {dispatch} = store;

const useSelector = useAppSelector;

const useDispatch = () => useAppDispatch();

export {store, dispatch, useSelector, useDispatch}