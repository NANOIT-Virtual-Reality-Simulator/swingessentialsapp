import { success, failure } from '../../api/http-helper';
import { btoa, atob } from '../../utilities';
import * as ACTIONS from './types';
import { AUTH, BASEURL } from '../../constants';
import { loadLessons } from './LessonActions';
import { loadTips } from './TipActions';
import { loadCredits } from './CreditActions';
import { loadBlogs } from './BlogActions';
import { loadSettings } from './SettingsActions';
import { ThunkDispatch } from 'redux-thunk';
import { Credentials } from '../../__types__';
import { HttpRequest } from '../../api/http';
import { Logger } from '../../utilities/logging';
import * as Keychain from 'react-native-keychain';

// TODO: Handle fetch failure (on login esp) more gracefully
// TODO: timer to check pending users registration status update

export function requestLogin(userCredentials: Credentials, useTouch: boolean = false) {
    return (dispatch: ThunkDispatch<any, void, any>) => {
        dispatch({ type: ACTIONS.LOGIN.REQUEST });
        return fetch(BASEURL + '/' + ACTIONS.LOGIN.API, {
            headers: {
                [AUTH]: 'Basic ' + btoa(userCredentials.username) + '.' + btoa(userCredentials.password),
            },
        })
            .then(response => {
                switch (response.status) {
                    case 200:
                        if (useTouch) Keychain.setGenericPassword(userCredentials.username, userCredentials.password);
                        else Keychain.resetGenericPassword();

                        const token = response.headers.get('Token');
                        response
                            .json()
                            .then(json => {
                                dispatch(success(ACTIONS.LOGIN.SUCCESS, { ...json, token: token }));
                            })
                            .then(() => {
                                dispatch(loadUserContent());
                            });
                        break;
                    default:
                        Keychain.resetGenericPassword();
                        dispatch(failure(ACTIONS.LOGIN.FAILURE, response, 'Login'));
                        break;
                }
            })
            .catch(error => {
                Keychain.resetGenericPassword();
                Logger.logError({
                    code: 'ACTLGN100',
                    description: `Exception encountered while executing login request.`,
                    rawErrorCode: error.code,
                    rawErrorMessage: error.error,
                });
            });
    };
}
/* clears the current authentication token */
export function requestLogout(token: string) {
    return (dispatch: ThunkDispatch<any, void, any>) => {
        dispatch({ type: ACTIONS.LOGOUT.REQUEST });
        HttpRequest.get(ACTIONS.LOGOUT.API)
            .withFullResponse()
            .onSuccess((response: any) => {
                dispatch(success(ACTIONS.LOGOUT.SUCCESS));
                dispatch(loadTips());
            })
            .onFailure((response: Response) => {
                // checkTimeout(response, dispatch);
                dispatch(failure(ACTIONS.LOGOUT.FAILURE, response, 'Logout'));
            })
            .request();
    };
}

export function refreshToken() {
    return (dispatch: ThunkDispatch<any, void, any>) => {
        dispatch({ type: ACTIONS.REFRESH_TOKEN.REQUEST });
        HttpRequest.get(ACTIONS.REFRESH_TOKEN.API)
            .withFullResponse()
            .onSuccess((response: any) => {
                const token = response.headers.get('Token');
                dispatch(success(ACTIONS.REFRESH_TOKEN.SUCCESS, { token }));
            })
            .onFailure((response: Response) => {
                dispatch(failure(ACTIONS.REFRESH_TOKEN.FAILURE, response, 'TokenRefresh'));
            })
            .request();
    };
}

export function setToken(token: string) {
    return (dispatch: ThunkDispatch<any, void, any>) => {
        const exp = JSON.parse(atob(token.split('.')[1])).exp;
        const expired = exp < Date.now() / 1000;
        if (expired) {
            Logger.logMessage(`Local token has expired.`);
        }
        dispatch({ type: ACTIONS.SET_TOKEN.REQUEST, payload: { token: expired ? null : token } });
        dispatch(loadUserContent());
    };
}

export function loadUserContent() {
    return (dispatch: ThunkDispatch<any, void, any>) => {
        // dispatch({type:DATA_FROM_TOKEN.REQUEST});
        dispatch(loadLessons());
        dispatch(loadCredits());
        dispatch(loadSettings());
        dispatch(loadTips());
        dispatch(loadBlogs());
    };
}
