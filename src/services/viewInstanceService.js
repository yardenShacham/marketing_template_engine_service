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

        return await appInjector.get(appServices.dbService).connect()
            .update(collections.views, {_id: viewId},
                {$set: {'instances.$[i].content': params}}, {arrayFilters: filter});
    }

    async getInstances(viewId) {
        return await appInjector.get(appServices.dbService).connect()
            .getCollection(collections.views, {_id: viewId}, null, {instances: 1, _id: 0})
            .toArray();
    }

    async appandNewViewInstance(viewId, instanceName) {
        const newInstance = this.getInstanceViewObj(instanceName)
        await appInjector.get(appServices.dbService).connect()
            .update(collections.views, {_id: viewId}, {
                $push: {instances: newInstance}
            });
        await this.appandRoute(newInstance._id, this.getDefaultRoute(instanceName));
    }

    async appandRoute(instanceId, route) {
        return await appInjector.get(appServices.dbService).connect()
            .insert(collections.viewsRoutes, {_id: instanceId, route}, false, {upsert: true});
    }

    async updateViewInstanceStaticData(viewId, viewInstanceId, instanceName, styles, js) {
        const query = getInstanceQuery(viewId, viewInstanceId);
        let action = this.appandToAction(this.getTemplatesAction(null, styles, js), "$set", "name", instanceName)

        return await appInjector.get(appServices.dbService).connect()
            .update(collections.views, query, action);
    }

    async removeInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);

        return await appInjector.get(appServices.dbService).connect()
            .remove(collections.views, query);
    }

    async getInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);

        return await appInjector.get(appServices.dbService).connect()
            .getSingle(collections.views, query);
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