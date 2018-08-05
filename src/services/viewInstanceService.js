import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {errors} from '../consts/errors';
import {kebabCase, difference} from 'lodash';
import {getTemplateParams} from '../Utils/string';
import {errorTypes} from '../consts/errors';
import {getError} from '../api/infra/errorHandler';
import {getInstanceQuery, getTemplatesAction, getQueryId, getObjectId} from '../Utils/db';
import {appInjector} from '../app-injector'


export class viewInstanceService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    getContentFieldsToUpdate(newHtml, oldHtml = "") {
        const newParams = getTemplateParams(newHtml);
        const oldParams = getTemplateParams(oldHtml);
        return difference(newParams, oldParams);
    }

    async updateContentParams(viewId, newHtml, oldHtml = "") {
        const differenceParams = this.getContentFieldsToUpdate(newHtml, oldHtml);
        if (differenceParams && differenceParams.length > 0) {
            const fieldsSetAction = differenceParams.reduce((fields, nextParam) => {
                fields[`instances.$[].content.${nextParam}`] = '';
                return fields;
            }, {});

            const dbService = await this.getDbService();
            await dbService.update(collections.views, getQueryId(viewId),
                {$set: fieldsSetAction}, true);
            dbService.close();
        }
    }

    async getInstances(viewId) {
        try {
            const dbService = await this.getDbService();
            const cursor = dbService
                .aggregate(collections.views, [{
                    $match: getQueryId(viewId)
                }, {
                    $unwind: "$instances"
                }, {
                    $lookup:
                        {
                            from: collections.viewsRoutes,
                            localField: "instances._id",
                            foreignField: "_id",
                            as: "all_instances"
                        }
                }, {
                    $replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ["$all_instances", 0]}, "$$ROOT"]}}
                }, {
                    $project: {
                        _id: 0, name: 0, hasHtmlTemplate: 0,
                        all_instances: 0, "instances.content": 0
                    }
                }, {
                    $project: {
                        "viewInstanceId": "$instances._id",
                        "name": "$instances.name",
                        "isHasStyles": {
                            $cond: {
                                if: {$ifNull: ["$instances.styles", false]},
                                then: true,
                                else: false
                            }
                        },
                        "isHasJs": {
                            $cond: {
                                if: {$ifNull: ["$instances.js", false]},
                                then: true,
                                else: false
                            }
                        },
                        "route": "$route"
                    }
                }]);
            const instances = await dbService.getAllCursor(cursor);
            dbService.close();
            return instances;
        }
        catch (e) {
            console.log(e);
            return getError(errorTypes.generalError, e);
        }
    }

    async addNewViewInstance(viewId, instanceName) {
        const dbService = await this.getDbService();
        const htmlTemplate = await appInjector.get(appServices.viewsService).getViewTemplate(viewId);
        const content = this.getContentFieldsToUpdate(htmlTemplate).reduce((content, nextField) => {
            content[nextField] = "";
            return content;
        }, {});
        const newInstance = this.getInstanceViewObj(instanceName, null, null, content);
        await dbService.update(collections.views, getQueryId(viewId), {
            $push: {instances: newInstance}
        });
        await this.appandRoute(newInstance._id, this.getDefaultRoute(instanceName), dbService);
        dbService.close();
        return newInstance._id;
    }

    async appandRoute(instanceId, route, dbService = null) {
        const service = dbService || this.getDbService();
        const result = await service.insert(collections.viewsRoutes, {_id: instanceId, route}, {upsert: true});
        if (!dbService)
            service.close();

        return result;
    }

    async updateViewInstanceStaticData(viewId, viewInstanceId, instanceName, styles, js) {
        const query = getInstanceQuery(viewId, viewInstanceId);
        let action = this.appandToAction(getTemplatesAction(null, styles, js), "$set", "instances.$.name", instanceName)

        const dbService = await this.getDbService();
        const result = await dbService.findAndModify(collections.views, query, action);
        dbService.close();
        return result;
    }

    async removeInstance(viewId, instanceId) {
        const dbService = await this.getDbService();
        await dbService.removeArrayItemById(collections.views, "instances", getQueryId(viewId), instanceId);
        await dbService.remove(collections.viewsRoutes, getQueryId(instanceId));
        dbService.close();
    }

    async getInstance(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.views, query);
        dbService.close();
        return result;
    }

    getInstanceViewObj(instanceName, styles, js, content = {}) {
        return {
            _id: getObjectId(),
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
        return action;
    }
}