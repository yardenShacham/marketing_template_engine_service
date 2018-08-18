import {AppRouter} from '../infra/router';
import {appInjector} from '../../app-injector';
import {appServices} from "../../consts/appServices";

const router = new AppRouter();

class ViewRouter {

    @router.get('/')
    getViews() {
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

    @router.post('/:viewId/viewTemplate')
    appendHtmlTemplate({viewId}, {htmlTemplate}) {
        return appInjector.get(appServices.viewsService)
            .appendHtmlTemplate(viewId, htmlTemplate);
    }

    @router.post('/:viewId/viewStyles')
    appendStyles({viewId}, {styles}) {
        return appInjector.get(appServices.viewsService).appendStyles(viewId, styles);
    }

    @router.post('/:viewId/viewBehavior')
    appendJs({viewId}, {js}) {
        return appInjector.get(appServices.viewsService).appendJs(viewId, js);
    }

    @router.get('/:viewId/styles')
    getViewStyles({viewId}) {
        return appInjector.get(appServices.viewsService).getViewStyles(viewId);
    }

    @router.put('/:viewId')
    updateViewName({viewId}, {viewName}) {
        return appInjector.get(appServices.viewsService).updateViewName(viewId, viewName);
    }
}

export default router.getRouter();



