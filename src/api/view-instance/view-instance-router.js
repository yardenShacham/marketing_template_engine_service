import {AppRouter, get} from '../infra/router';

class ViewInstanceRouter {

    @get('/')
    getViews(req, res) {
        return ["yarden works"];
    }
}

export default AppRouter(ViewInstanceRouter);