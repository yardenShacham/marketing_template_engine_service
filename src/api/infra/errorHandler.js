import {errors} from '../../consts/errors';

export const getError = (errorType, e) => {
    const error = new Error(e);
    error.data = errors[errorType];
    return error;
};