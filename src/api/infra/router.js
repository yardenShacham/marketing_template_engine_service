import {overideMethodDecorator} from '../../Utils/decorators';
import {Router} from 'express';

let originalRouter = null;
export const get = (route) => {
    return overideMethodDecorator((originalFunction, ...args) => {
        originalRouter.get(route, (req, res) => {
            const result = originalFunction.apply(this, args);
            if (result instanceof Error) {
                const {status, error} = result;
                res.status(status).send(error);
            }
            else {
                res.json(result);
            }
        });
    });
};

export const Post = () => {

};

export const Delete = () => {

};

export const Put = () => {

};

export const Custom = () => {

};


export const AppRouter = (router, options) => {
    originalRouter = Router(options);
    new router();
};



