import {appServices} from '../consts/appServices';
import {collections, ACTION_TYPES} from '../consts/db';
import {isEmptyObject} from '../Utils/object';
import {kebabCase, forEach, reduce} from 'lodash';
import {errorTypes} from '../consts/errors';
import {DEFAULT_DATA_BY_TYPE} from '../consts/instances';
import {getError} from '../api/infra/errorHandler';
import {getInstanceQuery, getTemplatesAction, getQueryId, getObjectId} from '../Utils/db';
import {appInjector} from '../app-injector'


export class viewInstanceService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    getContentFieldsToUpdate(newHtml, oldHtml = "") {
        const paramsToAdd = [], paramsToRemove = [], paramsTypeToUpdate = [];
        const newParams = appInjector.get(appServices.templateEngineService).compileToContentParams(newHtml);
        if (oldHtml) {
            const oldParams = appInjector.get(appServices.templateEngineService).compileToContentParams(oldHtml);
            forEach(newParams, (value, paramName) => {
                if (!oldParams[paramName]) {
                    value.data = DEFAULT_DATA_BY_TYPE[value.type](paramName);
                    paramsToAdd.push({
                        paramName,
                        value
                    });
                }
                else if (oldParams[paramName] && oldParams[paramName].type !== value.type) {
                    paramsTypeToUpdate.push({
                        paramName,
                        type: value.type
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

        return newParams;
    }

    async updateContentParams(viewId, newHtml, oldHtml = "") {
        const fieldActions = this.getContentFieldsToUpdate(newHtml, oldHtml);
        if (fieldActions) {
            const dbService = await this.getDbService();
            const {paramsToAdd, paramsToRemove, paramsTypeToUpdate} = fieldActions;
            let fieldsSetAction = {}, fieldsRemoveAction = {};
            if (paramsToAdd && paramsToAdd.length > 0) {
                fieldsSetAction = paramsToAdd.reduce((fields, nextParam) => {
                    fields[`instances.$[].content.${nextParam.paramName}`] = nextParam.value;
                    return fields;
                }, fieldsSetAction);
            }
            if (paramsTypeToUpdate.length > 0) {
                fieldsSetAction = paramsTypeToUpdate.reduce((fields, nextParam) => {
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
        const {html} = await appInjector.get(appServices.viewsService).getViewTemplate(viewId);
        const contentFields = this.getContentFieldsToUpdate(html);
        if (!isEmptyObject(contentFields)) {
            const route = this.getDefaultRoute(instanceName);
            const newInstance = this.getInstanceViewObj(instanceName, null, null, contentFields);
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
        let action = this.appandToAction(getTemplatesAction({
            styles,
            js
        }), ACTION_TYPES.set, "instances.$.name", instanceName)

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

    async getInstanceContentParams(viewId, instanceId) {
        const query = getInstanceQuery(viewId, instanceId);
        const dbService = await this.getDbService();
        const {instances} = await dbService.getSingle(collections.views, query, {
            _id: 0,
            "instances.content": 1
        });
        dbService.close();
        return instances[0].content;
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