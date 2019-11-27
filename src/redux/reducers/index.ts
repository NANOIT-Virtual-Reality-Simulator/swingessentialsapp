import { combineReducers } from 'redux';
import { loginReducer } from './authentication';
import { lessonsReducer } from './lessons';
import { tipsReducer } from './tips';
import { userDataReducer } from './userData';
import { creditsReducer } from './credits';

export const AppReducer = combineReducers({
    login: loginReducer,
    lessons: lessonsReducer,
    tips: tipsReducer,
    userData: userDataReducer,
    credits: creditsReducer,
});