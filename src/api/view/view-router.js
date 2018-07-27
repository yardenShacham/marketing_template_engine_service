import {AppRouter, get} from '../infra/router';

class ViewRouter {

    @get('/')
    getViews(req, res) {
        return ["yarden works"];
    }
}

export default AppRouter(ViewRouter);