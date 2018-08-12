import {appServices} from '../consts/appServices';
import {collections, ACTION_TYPES} from '../consts/db';
import {isEmptyObject} from '../Utils/object';
import {kebabCase, forEach, reduce} from 'lodash';
import {errorTypes} from '../consts/errors';
import {getError} from '../api/infra/errorHandler';
import {getInstanceQuery, getTemplatesAction, getQueryId, getObjectId} from '../Utils/db';
import {appInjector} from '../app-injector'


export class viewInstanceService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    getContentFieldsToUpdate(newHtml, oldHtml = "") {
        const paramsToAdd = [], paramsToRemove = [], paramsTypeToUpdate = [];
        const newParams = appInjector.get(appServices.templateEngineService).getContentParams(newHtml);
        const oldParams = appInjector.get(appServices.templateEngineService).getContentParams(oldHtml);
        forEach(newParams, (val, paramName) => {
            if (!oldParams[paramName]) {
                paramsToAdd.push({
                    paramName,
                    value: newParams[paramName]
                });
            }
            else if (oldParams[paramName] && oldParams[paramName].type !== newParams[paramName].type) {
                paramsTypeToUpdate.push({
                    paramName,
                    type: newParams[paramName].type
                });
            }
        });
        forEach(oldParams, (val, paramName) => {
            if (!newParams[paramName]) {
                paramsToRemove.push(paramName);
            }
        });
        return paramsToAdd.length < 1 && paramsToRemove.length < 1 && paramsTypeToUpdate.length < 1 ? null : {
            paramsToAdd,
            paramsToRemove,
            paramsTypeToUpdate
        };
    }

    async updateContentParams(viewId, newHtml, oldHtml = "") {
        const fieldToUpdate = this.getContentFieldsToUpdate(newHtml, oldHtml);
        if (fieldToUpdate) {
            const dbService = await this.getDbService();
            const {paramsToAdd, paramsToRemove, paramsTypeToUpdate} = fieldToUpdate;
            let fieldsSetAction = {}, fieldsRemoveAction = {};
            if (paramsToAdd && paramsToAdd.length > 0) {
                fieldsSetAction = paramsToAdd.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam.paramName}`] = nextParam.value;
                    return fields;
                }, fieldsSetAction);
            }
            if (paramsTypeToUpdate) {
                fieldsSetAction = paramsToAdd.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam.paramName}.type`] = nextParam.type;
                    return fields;
                }, fieldsSetAction);
            }
            if (paramsToRemove && paramsToRemove.length > 0) {
                fieldsRemoveAction = paramsToRemove.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam}`] = "";
                    return fields;
                }, fieldsRemoveAction);
            }
            let action = {};
            if (!isEmptyObject(fieldsSetAction))
                action[ACTION_TYPES.set] = fieldsSetAction;
            if (!isEmptyObject(fieldsRemoveAction))
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
                `${instanceArrayPointer}.${key}.data`, value);
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
        await this.appandRoute(newInstance._id, route, false);
        dbService.close();
        return {
            viewInstanceId: newInstance._id,
            name: newInstance.name,
            isHasStyles: false,
            isHasJs: false,
            route
        };
    }

    async appandRoute(instanceId, route, isSelfDispose = true) {
        const service = await this.getDbService();
        const result = await service.save(collections.viewsRoutes, {
            _id: isSelfDispose ? getObjectId(instanceId) : instanceId,
            route
        });
        if (isSelfDispose)
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