import {AppRouter} from '../infra/router';
import {appInjector} from '../../app-injector';
import {appServices} from "../../consts/appServices";
import {errorTypes} from "../../consts/errors";
import {getError} from "../infra/errorHandler";

const router = new AppRouter();

class InstanceContentRouter {

    @router.patch('/')
    updateInstanceContent({viewId, viewInstanceId}, {updateContentParams}) {
        return appInjector.get(appServices.viewInstanceService)
            .updateContent(viewId, viewInstanceId, updateContentParams);
    }

    @router.get('/:viewId/:instanceId/preview')
    getContentPreview({viewId, instanceId}) {

    }

    @router.get('/:viewId/:instanceId')
    getContent({viewId, instanceId}) {

    }

}

export default router.getRouter();