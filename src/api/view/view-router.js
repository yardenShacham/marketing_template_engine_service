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

    @router.delete('/:viewId')
    removeView({viewId}) {
        return appInjector.get(appServices.viewsService).removeView(viewId);
    }

    @router.post('/viewTemplate')
    appendNewViewTemplate({viewId, htmlTemplate, css, js}) {

    }

    @router.put('/viewTemplate')
    updateViewTemplate({viewId, htmlTemplate, css, js}) {
        return appInjector.get(appServices.viewsService)
            .updateViewTemplate(viewId, htmlTemplate, css, js);
    }

}

export default router.getRouter();



