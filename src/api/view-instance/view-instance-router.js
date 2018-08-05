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
            .updateViewInstanceStaticData(viewId, viewInstanceId, viewInstanceName);
    }

    @router.delete('/')
    removeViewInstance({viewId, viewInstanceId}) {
        return appInjector.get(appServices.viewInstanceService)
            .removeInstance(viewId, viewInstanceId);
    }
}

export default router.getRouter();