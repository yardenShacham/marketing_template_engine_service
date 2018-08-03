import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {getTemplatesAction} from '../Utils/db';
import {appInjector} from '../app-injector';

export class viewsService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    async createNewView(viewName) {
        const dbService = await this.getDbService();
        const result = await dbService.insert(collections.views, {
            name: viewName,
            hasHtmlTemplate: false,
            instances: []
        });
        dbService.close();
        if (result) {
            return {
                viewId: result,
                name: viewName,
                hasHtmlTemplate: false,
                instances: []
            };
        }

        return null;
    }

    async updateViewName(viewId, viewName) {
        const dbService = await this.getDbService();
        const result = await dbService.update(collections.views, {_id: viewId}, {$set: {name: viewName}});
        dbService.close();
        if (result) {
            const {value} = result;
            return {
                viewId: value._id,
                name: viewName,
                hasHtmlTemplate: value.hasHtmlTemplate,
            };
        }
    }

    async appendHtmlTemplate(viewId, html) {
        const dbService = await this.getDbService();
        const viewInfo = await dbService.getSingle(collections.views, {_id: viewId}, {
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
            _id: viewId,
            html: htmlTemplate,
            css: css || null,
            js: js || null
        }, false);
        await appInjector.get(appServices.viewInstanceService)
            .updateContentParams(viewId, htmlTemplate);
        await dbService.update(collections.views, {_id: viewId}, {$set: {hasHtmlTemplate: true}});
        dbService.close();
    }

    async updateViewTemplate(viewId, htmlTemplate, css, js) {
        const dbService = await this.getDbService();
        const {html} = await this.getViewTemplate(viewId);
        await dbService.update(collections.viewsTemplates, {_id: viewId}, getTemplatesAction(htmlTemplate, css, js));
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
            .find({_id: viewId})
            .project({
                "instances._id": 1,
                _id: 0
            })
            .map((view) => view.instances)
            .toArray();

        await dbService.getDbCollection(collections.viewsRoutes)
            .remove({_id: {$in: idsToRemove.map(item => item._id)}})
    }

    async getViewTemplate(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.viewsTemplates, {_id: viewId});
        dbService.close();
        return result;
    }

    async getView(viewId) {
        const dbService = await this.getDbService();
        const result = await dbService.getSingle(collections.views, {_id: viewId});
        dbService.close();
        return result;
    }

}