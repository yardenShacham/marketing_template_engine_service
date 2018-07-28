import {AppRouter} from '../infra/router';

const router = new AppRouter();

class ViewRouter {

    @router.get('/')
    getViews(req, res) {
        return ["yarden works"];
    }
}

export default router.getRouter();



