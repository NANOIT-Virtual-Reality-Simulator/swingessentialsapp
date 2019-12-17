import { LOGIN, LOGOUT, CREATE_ACCOUNT, SET_TOKEN } from '../actions/types';
import { getUserRole } from '../../utilities';
import { LoginState } from '../../__types__';

const initialState: LoginState = {
    token: null,
    admin: false,
    role: 'anonymous',
    modalWarning: false,
    failCount: 0,
    pending: false,
};

export const loginReducer = (state = initialState, action): LoginState => {
    switch (action.type) {
        case LOGIN.REQUEST:
            return {
                ...state,
                pending: true,
            };
        case LOGIN.SUCCESS:
        case CREATE_ACCOUNT.SUCCESS:
        case SET_TOKEN.REQUEST:
            return {
                ...state,
                modalWarning: false,
                failCount: 0,
                token: action.payload.token,
                pending: false,
                role: getUserRole(action.payload.token),
                //admin: (JSON.parse(atob(action.data.token.split('.')[1]))['role'].toLowerCase() === 'administrator')
            };
        case LOGIN.FAILURE:
            return {
                ...state,
                token: null,
                admin: false,
                pending: false,
                role: 'anonymous',
                failCount: state.failCount + 1,
            };
        case LOGOUT.SUCCESS:
            return {
                ...state,
                token: null,
                admin: false,
                pending: false,
                role: 'anonymous',
                failCount: 0,
            };
        default:
            return state;
    }
};
