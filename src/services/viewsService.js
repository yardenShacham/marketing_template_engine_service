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
            instances: []
        });
        dbService.close();
        if (newViewId) {
            return {
                viewId: newViewId,
                name: viewName,
                hasHtmlTemplate: false,
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
        const viewInfo = await dbService.getSingle(collections.views, getQueryId(viewId), {
            instances: 0
        });
        if (viewInfo.hasHtmlTemplate) {
            await this.updateViewTemplate(viewId, html);
        }
        else {
            await this.appendNewViewTemplate(viewId, html);
        }
        return {
            viewId: viewInfo._id,
            name: viewInfo.name,
            hasHtmlTemplate: true
        };
    }

    async appendNewViewTemplate(viewId, htmlTemplate, css, js) {
        const dbService = await this.getDbService();
        await dbService.insert(collections.viewsTemplates, {
            _id: getObjectId(viewId),
            html: htmlTemplate,
            css: css || null,
            js: js || null
        });
        await appInjector.get(appServices.viewInstanceService)
            .updateContentParams(viewId, htmlTemplate);
        await dbService.update(collections.views, getQueryId(viewId), {$set: {hasHtmlTemplate: true}});
        dbService.close();
    }

    async updateViewTemplate(viewId, htmlTemplate, css, js) {
        const dbService = await this.getDbService();
        const {html} = await this.getViewTemplate(viewId);
        await dbService.update(collections.viewsTemplates, getQueryId(viewId), getTemplatesAction(htmlTemplate, css, js));
        await appInjector.get(appServices.viewInstanceService)
            .updateContentParams(viewId, htmlTemplate, html);
        dbService.close();
        return true;
    }

    async getAllViews() {
        const dbService = await this.getDbService();
        const result = await dbService.getAndMap(collections.views, (view) => ({
            viewId: view._id,
            name: view.name,
            hasHtmlTemplate: view.hasHtmlTemplate
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

    async getView(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.views, getQueryId(viewId));
        dbService.close();
        return result;
    }
}