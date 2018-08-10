import {appServices} from '../consts/appServices';
import {collections, ACTION_TYPES} from '../consts/db';
import {errors} from '../consts/errors';
import {kebabCase, remove, reduce} from 'lodash';
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
        const oldCopy = [...oldParams];
        const newCopy = [...newParams];
        remove(oldCopy, (oldP) => !!newCopy.find(newP => newP === oldP));
        remove(newParams, (newP) => !!oldParams.find(oldP => oldP === newP));

        return newParams.length < 1 && oldCopy.length < 1 ? null : {
            paramsToAdd: newParams,
            paramsToRemove: oldCopy
        };
    }

    async updateContentParams(viewId, newHtml, oldHtml = "") {
        const fieldToUpdate = this.getContentFieldsToUpdate(newHtml, oldHtml);
        if (fieldToUpdate) {
            const dbService = await this.getDbService();
            const {paramsToAdd, paramsToRemove} = fieldToUpdate;
            let fieldsSetAction, fieldsRemoveAction;
            if (paramsToAdd && paramsToAdd.length > 0) {
                fieldsSetAction = paramsToAdd.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam}`] = '';
                    return fields;
                }, {});
            }

            if (paramsToRemove && paramsToRemove.length > 0) {
                fieldsRemoveAction = paramsToRemove.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam}`] = "";
                    return fields;
                }, {});
            }
            let action = {};
            if (fieldsSetAction)
                action[ACTION_TYPES.set] = fieldsSetAction;
            if (fieldsRemoveAction)
                action[ACTION_TYPES.unset] = fieldsRemoveAction;

            await dbService.update(collections.views, getQueryId(viewId), action, true);
            dbService.close();
        }
    }


    async updateContent(viewId, viewInstanceId, contentParamsToUpdate) {
        const query = getInstanceQuery(viewId, viewInstanceId);
        const instanceArrayPointer = "instances.$.content";
        const action = reduce(contentParamsToUpdate, (updatedContentAction, value, key) => {
            return this.appandToAction(updatedContentAction, ACTION_TYPES.set,
                `${instanceArrayPointer}.${key}`, value);
        }, {[ACTION_TYPES.set]: {}});
        const dbService = await this.getDbService();
        const result = await dbService.update(collections.views, query, action);
        dbService.close();
        return result;
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
        const fieldToUpdate = this.getContentFieldsToUpdate(htmlTemplate);

        const content = (fieldToUpdate || []).reduce((content, nextField) => {
            content[nextField] = "";
            return content;
        }, {});
        const route = this.getDefaultRoute(instanceName);
        const newInstance = this.getInstanceViewObj(instanceName, null, null, content);
        await dbService.update(collections.views, getQueryId(viewId), {
            $push: {instances: newInstance}
        });
        await this.appandRoute(newInstance._id, route, dbService);
        dbService.close();
        return {
            viewInstanceId: newInstance._id,
            name: newInstance.name,
            isHasStyles: false,
            isHasJs: false,
            route
        };
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
        let action = this.appandToAction(getTemplatesAction(null, styles, js), ACTION_TYPES.set, "instances.$.name", instanceName)

        const dbService = await this.getDbService();
        await dbService.update(collections.views, query, action);
        dbService.close();
        return instanceName;
    }

    async removeInstance(viewId, instanceId) {
        const dbService = await this.getDbService();
        await dbService.removeArrayItemById(collections.views, "instances", getQueryId(viewId), instanceId);
        await dbService.remove(collections.viewsRoutes, getQueryId(instanceId));
        dbService.close();
        return true;
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