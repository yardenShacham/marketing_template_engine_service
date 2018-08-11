import {AppRouter} from '../infra/router';
import {appInjector} from '../../app-injector';
import {appServices} from "../../consts/appServices";
import {errorTypes} from "../../consts/errors";
import {getError} from "../infra/errorHandler";

const router = new AppRouter();

class ViewInstanceRouter {

    @router.get('/')
    getAllViewInstances({viewId}) {
        return appInjector.get(appServices.viewInstanceService).getInstances(viewId);
    }

    @router.post('/')
    createNewInstance({viewId, viewInstanceName}) {
        if (viewId && viewInstanceName) {
            return appInjector.get(appServices.viewInstanceService)
                .addNewViewInstance(viewId, viewInstanceName);
        }

        return getError(errorTypes.validationError, "argument not exist in body");
    }

    @router.put('/')
    updateInstanceName(params, {viewId, viewInstanceId, viewInstanceName}) {
        return appInjector.get(appServices.viewInstanceService)
            .updateViewInstanceStaticData(viewId, viewInstanceId, viewInstanceName).then(() => {
                return viewInstanceName;
            });
    }

    @router.put('/route')
    updateRoute(params, {viewInstanceId, newRoute}) {
        return appInjector.get(appServices.viewInstanceService)
            .appandRoute(viewInstanceId, newRoute).then(() => {
                return newRoute;
            });
    }

    @router.delete('/')
    removeViewInstance({viewId, viewInstanceId}) {
        return appInjector.get(appServices.viewInstanceService)
            .removeInstance(viewId, viewInstanceId);
    }

    @router.patch('/')
    updateInstanceContent({viewId, viewInstanceId}, {updateContentParams}) {
        return appInjector.get(appServices.viewInstanceService)
            .updateContent(viewId, viewInstanceId, updateContentParams);
    }
}

export default router.getRouter();