import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {getTemplatesAction} from '../Utils/db';
import {appInjector} from '../dependencies.register'

export class viewsService {

    async getDbService() {
        return this.dbService || await appInjector.get(appServices.dbService).connect();
    }

    async createNewView(viewName) {
        const dbService = await this.getDbService();
        const result = await dbService.insert(collections.views, {
            name: viewName,
            instances: []
        });
        dbService.close();
        return result;
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
        dbService.close();
        return true;
    }

    async getAllViews() {
        const dbService = await this.getDbService();
        const result = await dbService.getAndMap(collections.views, (view) => ({
            viewId: view._id,
            name: view.name
        }));

        dbService.close();
        return result;
    }

    async removeView(viewId) {
        const dbService = await this.getDbService();
        await this.removeAllRelatedRoute(viewId);
        await dbService.removeById(collections.viewsTemplates, viewId);
        await dbService.removeById(collections.views, viewId);

        dbService.close();
        return true;
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