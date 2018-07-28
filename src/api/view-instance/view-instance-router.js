import {AppRouter} from '../infra/router';

const router = new AppRouter();

class ViewInstanceRouter {

    @router.get('/')
    getViews(req, res) {
        return ["yarden"];
    }
}

export default router.getRouter();