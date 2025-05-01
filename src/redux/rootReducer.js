//take all the slices that we are creating (combined all the reducers)
import { combineReducers } from "redux";
import appReducer from './slices/app'
import chatReducer from './slices/chat'

//create combine reducer
const rootReducer = combineReducers({
    app: appReducer,
    chat: chatReducer
});

export { rootReducer }