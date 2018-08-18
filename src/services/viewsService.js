import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {errorTypes} from '../consts/errors';
import {getError} from '../api/infra/errorHandler';
import {getTemplatesAction, getQueryId, getObjectId} from '../Utils/db';
import {appInjector} from '../app-injector';

export class viewsService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    async createNewView(viewName) {
        const dbService = await this.getDbService();
        const newViewId = await dbService.insert(collections.views, {
            name: viewName,
            hasHtmlTemplate: false,
            hasStyles: false,
            hasJs: false,
            instances: []
        });
        dbService.close();
        if (newViewId) {
            return {
                viewId: newViewId,
                name: viewName,
                hasHtmlTemplate: false,
                hasStyles: false,
                hasJs: false,
                instances: []
            };
        }

        return null;
    }

    async updateViewName(viewId, viewName) {
        const dbService = await this.getDbService();
        try {
            const result = await dbService.update(collections.views, getQueryId(viewId), {$set: {name: viewName}});
            dbService.close();
            if (result && result.value) {
                const {value} = result;
                return {
                    viewId: value._id,
                    name: viewName,
                    hasHtmlTemplate: value.hasHtmlTemplate,
                    hasStyles: value.hasStyles,
                    hasJs: value.hasJs
                };
            }
            return getError(errorTypes.generalError);
        }
        catch (e) {
            return getError(errorTypes.generalError, e);
        }

    }

    async appendHtmlTemplate(viewId, html) {
        const dbService = await this.getDbService();
        const cursor = dbService
            .aggregate(collections.views, [{
                $match: getQueryId(viewId)
            }, {
                $project: {
                    "totalInstances": {$size: "$instances"},
                    hasStyles: 1, hasJs: 1, name: 1
                }
            }]);
        const isExist = await dbService.getSingle(collections.viewsTemplates,
            getQueryId(viewId), {
                _id: 1
            });
        const {hasStyles, hasJs, name, totalInstances} = await dbService.getSingleFromCursor(cursor) || {};
        if (isExist) {
            await this.updateViewHtmlTemplate(viewId, html, totalInstances);
        }
        else {
            await this.appendNewViewTemplate(viewId, html, totalInstances);
        }
        return {
            viewId,
            name,
            hasHtmlTemplate: true,
            hasStyles,
            hasJs
        };
    }

    async appendNewViewTemplate(viewId, htmlTemplate, totalInstances) {
        const dbService = await this.getDbService();
        await dbService.insert(collections.viewsTemplates, {
            _id: getObjectId(viewId),
            html: htmlTemplate,
            styles: null,
            js: null
        });
        if (totalInstances > 0) {
            await appInjector.get(appServices.viewInstanceService)
                .updateContentParams(viewId, htmlTemplate);
        }
        await dbService.update(collections.views, getQueryId(viewId), {$set: {hasHtmlTemplate: true}});
        dbService.close();
    }

    async updateViewHtmlTemplate(viewId, htmlTemplate, totalInstances) {
        const dbService = await this.getDbService();
        const {html} = await this.getViewTemplate(viewId);
        await dbService.update(collections.viewsTemplates, getQueryId(viewId), getTemplatesAction({htmlTemplate}));
        if (totalInstances > 0) {
            await appInjector.get(appServices.viewInstanceService)
                .updateContentParams(viewId, htmlTemplate, html);
        }
        dbService.close();
    }

    async appendStyles(viewId, styles) {
        const dbService = await this.getDbService();
        const isExist = await dbService.getSingle(collections.viewsTemplates, getQueryId(viewId), {
            _id: 1
        });
        isExist ? await this.updateStyle(viewId, styles) : await this.appendNewStyle(viewId, styles);

        return {hasStyles: true};
    }

    async appendNewStyle(viewId, styles) {
        const dbService = await this.getDbService();
        const compiledStyles = appInjector.get(appServices.templateEngineService)
            .compileStyles(styles);
        await dbService.insert(collections.viewsTemplates, {
            _id: getObjectId(viewId),
            html: null,
            styles: compiledStyles,
            js: null
        });
        await dbService.update(collections.views, getQueryId(viewId), {$set: {hasStyles: true}});
        dbService.close();
    }

    async updateStyle(viewId, styles) {
        const dbService = await this.getDbService();
        const compiledStyles = appInjector.get(appServices.templateEngineService)
            .compileStyles(styles);
        await dbService.update(collections.viewsTemplates, getQueryId(viewId), getTemplatesAction({styles: compiledStyles}));
        await dbService.update(collections.views, getQueryId(viewId), {$set: {hasStyles: true}});
        dbService.close();
    }

    async appendJs(viewId, js) {
        const dbService = await this.getDbService();
        await dbService.update(collections.viewsTemplates, getQueryId(viewId), getTemplatesAction({js}));
        await dbService.update(collections.views, getQueryId(viewId), {$set: {hasJs: true}});
        dbService.close();
        return {
            hasJs: true
        };
    }

    async getAllViews() {
        const dbService = await this.getDbService();
        const result = await dbService.getAndMap(collections.views, (view) => ({
            viewId: view._id,
            name: view.name,
            hasHtmlTemplate: view.hasHtmlTemplate,
            hasStyles: view.hasStyles,
            hasJs: view.hasJs
        }));

        dbService.close();
        return result;
    }

    async removeView(viewId) {
        if (viewId) {
            const dbService = await this.getDbService();
            await this.removeAllRelatedRoute(viewId);
            await dbService.removeById(collections.viewsTemplates, viewId);
            await dbService.removeById(collections.views, viewId);

            dbService.close();
            return true;
        }
        return false;
    }

    async removeAllRelatedRoute(viewId) {
        const dbService = await this.getDbService();
        const [idsToRemove] = await dbService.getDbCollection(collections.views)
            .find(getQueryId(viewId))
            .project({
                "instances._id": 1,
                _id: 0
            })
            .map((view) => view.instances)
            .toArray();

        await dbService.getDbCollection(collections.viewsRoutes)
            .remove({"_id.$oid": {$in: idsToRemove.map(item => item._id)}})
    }

    async getViewTemplate(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.viewsTemplates, getQueryId(viewId), {_id: 0, html: 1});
        dbService.close();
        return result || {html: ""};
    }

    async getViewStyles(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.viewsTemplates, getQueryId(viewId), {_id: 0, styles: 1});
        dbService.close();
        return result.styles || {styles: ""};
    }
}