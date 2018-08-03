import {AppRouter} from '../infra/router';
import {appInjector} from '../../app-injector';
import {appServices} from "../../consts/appServices";

const router = new AppRouter();

class ViewRouter {

    @router.get('/')
    getViews(req) {
        return appInjector.get(appServices.viewsService).getAllViews();
    }

    @router.post('/')
    createNewView({viewName}) {
        return appInjector.get(appServices.viewsService).createNewView(viewName);
    }

    @router.delete('/')
    removeView({viewId}) {
        return appInjector.get(appServices.viewsService).removeView(viewId);
    }

    @router.post('/viewTemplate')
    appendHtmlTemplate({viewId, htmlTemplate}) {
        return appInjector.get(appServices.viewsService)
            .appendHtmlTemplate(viewId, htmlTemplate);
    }

    @router.put('/:viewId')
    updateViewName({viewId}, {viewName}) {
        return appInjector.get(appServices.viewsService).updateViewName(viewId, viewName);
    }
}

export default router.getRouter();



