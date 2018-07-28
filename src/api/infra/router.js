import {addtionalFunctionalityDecorator} from '../../Utils/decorators';
import {Router} from 'express';

export class AppRouter {

    constructor() {
        this.router = Router();
    }

    getRouter() {
        return this.router;
    }

    get(route) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.get(route, async (req, res) => {
                let result = await originalFunction(req);

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

    post(route) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.post(route, async (req, res) => {
                let result = await originalFunction(req.body);

                if (result instanceof Error) {
                    const {status, error} = result;
                    res.status(status).send(error);
                }
                else {
                    res.json(result);
                }
            });
        });
    }

    put(route) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.put(route, async (req, res) => {
                let result = await originalFunction(req.body);

                if (result instanceof Error) {
                    const {status, error} = result;
                    res.status(status).send(error);
                }
                else {
                    res.json(result);
                }
            });
        });
    }

    delete(route, status = 200) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.post(route, async (req, res) => {
                let result = await originalFunction(req.params);

                if (result instanceof Error) {
                    const {status, error} = result;
                    res.status(status || 500).send(error);
                }
                else {
                    res.status(status).json(result);
                }
            });
        });
    }

    custom() {

    }
};



