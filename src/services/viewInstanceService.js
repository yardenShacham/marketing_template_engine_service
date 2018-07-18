import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {kebabCase} from 'lodash';
import generateId from 'uuid/v1';
import {getTemplateParams} from '../Utils/string';

import {getInstanceQuery} from '../Utils/db';
import {appInjector} from '../dependencies.register'


export class viewInstanceService {

    async updateContentParams(viewId, html) {
        const params = getTemplateParams(html);
        const filter = params.map((param) => {
            return {
                [`i.content.${param}`]: {$exists: false}
            };
        }, {});

        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = await dbService.update(collections.views, {_id: viewId},
            {$set: {'instances.$[i].content': params}}, {arrayFilters: filter});
        dbService.close();
        return result;
    }

    async getInstances(viewId) {
        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = await dbService.getCollection(collections.views, {_id: viewId}, null, {
            instances: 1,
            _id: 0
        }).toArray();
        dbService.close();
        return result;
    }

    async appandNewViewInstance(viewId, instanceName) {
        const newInstance = this.getInstanceViewObj(instanceName)
        const dbService = await appInjector.get(appServices.dbService).connect();
        await dbService.update(collections.views, {_id: viewId}, {
            $push: {instances: newInstance}
        });
        await this.appandRoute(newInstance._id, this.getDefaultRoute(instanceName), dbService);
        dbService.close();
    }

    async appandRoute(instanceId, route, dbService = null) {
        const service = dbService || await appInjector.get(appServices.dbService).connect();
        const result = await service.insert(collections.viewsRoutes, {_id: instanceId, route}, false, {upsert: true});
        if (!dbService)
            service.close();

        return result;
    }

    async updateViewInstanceStaticData(viewId, viewInstanceId, instanceName, styles, js) {
        const query = getInstanceQuery(viewId, viewInstanceId);
        let action = this.appandToAction(this.getTemplatesAction(null, styles, js), "$set", "name", instanceName)

        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = dbService.update(collections.views, query, action);
        dbService.close();
        return result;
    }

    async removeInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);
        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = dbService.remove(collections.views, query);
        dbService.close();
        return result;
    }

    async getInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);

        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = dbService.getSingle(collections.views, query);
        dbService.close();
        return result;
    }

    getInstanceViewObj(instanceName, styles, js, content = {}) {
        return {
            _id: generateId(),
            name: instanceName,
            styles,
            js,
            content
        }
    }

    getDefaultRoute(instanceName) {
        return `/${kebabCase(instanceName)}`;
    }
}