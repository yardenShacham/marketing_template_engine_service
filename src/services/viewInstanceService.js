import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {kebabCase, difference} from 'lodash';
import generateId from 'uuid/v1';
import {getTemplateParams} from '../Utils/string';

import {getInstanceQuery, getTemplatesAction} from '../Utils/db';
import {appInjector} from '../dependencies.register'


export class viewInstanceService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    async updateContentParams(viewId, newHtml, oldHtml = "") {
        const newParams = getTemplateParams(newHtml);
        const oldParams = getTemplateParams(oldHtml);
        const differenceParams = difference(newParams, oldParams);
        if (differenceParams && differenceParams.length > 0) {
            const fieldsSetAction = differenceParams.reduce((fields, nextParam) => {
                fields[`instances.$[].content.${nextParam}`] = '';
                return fields;
            }, {});

            const dbService = await this.getDbService();
            await dbService.update(collections.views, {_id: viewId},
                {$set: fieldsSetAction}, true);
            dbService.close();
        }
    }

    async getInstances(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getCollection(collections.views, {_id: viewId})
            .project({
                instances: 1,
                _id: 0
            })
            .toArray();

        dbService.close();
        return result;
    }

    async appandNewViewInstance(viewId, instanceName) {
        const newInstance = this.getInstanceViewObj(instanceName);
        const dbService = await this.getDbService();
        await dbService.update(collections.views, {_id: viewId}, {
            $push: {instances: newInstance}
        });
        await this.appandRoute(newInstance._id, this.getDefaultRoute(instanceName), dbService);
        dbService.close();
        return newInstance._id;
    }

    async appandRoute(instanceId, route, dbService = null) {
        const service = dbService || this.getDbService();
        const result = await service.insert(collections.viewsRoutes, {_id: instanceId, route}, false, {upsert: true});
        if (!dbService)
            service.close();

        return result;
    }

    async updateViewInstanceStaticData(viewId, viewInstanceId, instanceName, styles, js) {
        const query = getInstanceQuery(viewId, viewInstanceId);
        let action = this.appandToAction(getTemplatesAction(null, styles, js), "$set", "name", instanceName)

        const dbService = await this.getDbService();
        const result = dbService.update(collections.views, query, action);
        dbService.close();
        return result;
    }

    async removeInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);
        const dbService = await this.getDbService();
        const result = dbService.remove(collections.views, query);
        dbService.close();
        return result;
    }

    async getInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);

        const dbService = await this.getDbService();
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

    appandToAction(action, actionType, propName, value) {
        action[actionType][propName] = value;
    }
}