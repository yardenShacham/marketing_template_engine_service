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
                let result = await originalFunction(req.query);

                if (result instanceof Error) {
                    const {status, code} = result.data;
                    res.status(status).send(code);
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
                    const {status, code} = result.data;
                    res.status(status).send(code);
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
                let result = await originalFunction(req.params, req.body);

                if (result instanceof Error) {
                    const {status, code} = result.data;
                    res.status(status).send(code);
                }
                else {
                    res.json(result);
                }
            });
        });
    }

    delete(route, status = 200) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.delete(route, async (req, res) => {
                let result = await originalFunction(req.body);

                if (result instanceof Error) {
                    const {status, code} = result.data;
                    res.status(status).send(code);
                }
                else {
                    res.status(status).json(result);
                }
            });
        });
    }

    patch(route, status = 200) {
        return addtionalFunctionalityDecorator((originalFunction) => {
            this.router.patch(route, async (req, res) => {
                let result = await originalFunction(req.query, req.body);

                if (result instanceof Error) {
                    const {status, code} = result.data;
                    res.status(status).send(code);
                }
                else {
                    res.json(result);
                }
            });
        });
    }

    custom() {

    }
};



