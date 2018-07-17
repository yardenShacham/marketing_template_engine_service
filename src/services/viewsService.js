import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {getInjector} from '../'

export class viewsService {

    async createNewView(viewName) {
        return await getInjector().get(appServices.dbService).connect()
            .insert(collections.views, {
                name: viewName,
                instances: []
            });
    }

    async addViewInstance(viewId, instanceName) {

    }
}