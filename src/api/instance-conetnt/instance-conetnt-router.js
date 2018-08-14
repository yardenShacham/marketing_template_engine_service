import {AppRouter} from '../infra/router';
import {appInjector} from '../../app-injector';
import {appServices} from "../../consts/appServices";
import {errorTypes} from "../../consts/errors";
import {getError} from "../infra/errorHandler";

const router = new AppRouter();
const getHtmlContentPreview = (viewId, instanceId) => {
    const tasks = [
        appInjector.get(appServices.viewsService).getViewTemplate(viewId),
        appInjector.get(appServices.viewInstanceService).getInstanceContentParams(viewId, instanceId)
    ];

    return Promise.all(tasks).then(([{html}, contentParams]) => {
        return appInjector.get(appServices.templateEngineService)
            .compile(contentParams, html, true);
    });
};

class InstanceContentRouter {

    @router.put('/:viewId/:instanceId')
    updateInstanceContent({viewId, instanceId}, {updateContentParams}) {
        return appInjector.get(appServices.viewInstanceService)
            .updateContent(viewId, instanceId, updateContentParams).then((result) => {
                if (result.value) {
                    return getHtmlContentPreview(viewId, instanceId);
                }
                return getError(errorTypes.generalError);
            });
    }

    @router.get('/:viewId/:instanceId/preview')
    getHtmlContentPreviewMode({viewId, instanceId}) {
        return getHtmlContentPreview(viewId, instanceId);
    }

}

export default router.getRouter();