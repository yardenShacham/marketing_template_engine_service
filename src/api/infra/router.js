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
            this.router.get(route, (req, res) => {
                const result = originalFunction(req);
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

    Post() {

    }

    Delete() {

    }

    Put() {

    }

    Custom() {

    }
};



