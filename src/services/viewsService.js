import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {getInstanceQuery} from '../Utils/db';
import {appInjector} from '../dependencies.register'

export class viewsService {

    async createNewView(viewName) {
        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = await dbService.insert(collections.views, {
            name: viewName,
            instances: []
        });
        dbService.close();
        return result;
    }

    async appendViewTemplate(viewId, htmlTemplate, css, js) {
        const dbService = await appInjector.get(appServices.dbService).connect();
        await dbService.insert(collections.viewsTemplates, {
            _id: viewId,
            html: htmlTemplate,
            css: css || null,
            js: js || null
        }, false, {upsert: true});
        await appInjector.get(appServices.viewInstanceService)
            .updateContentParams(viewId, htmlTemplate);
        dbService.close();
    }

    async getAllViews() {
        const dbService = await appInjector.get(appServices.dbService).connect();
        const result = dbService.getCollection(collections.views, null, null, {}).map((view) => ({
            viewId: view._id,
            name: view.name
        }));

        dbService.close();
        return result;
    }

    async removeView(viewId) {
        const dbService = await appInjector.get(appServices.dbService).connect();
        await dbService.removeById(collections.views, viewId);
        await dbService.removeById(collections.viewsTemplates, viewId);
        await dbService.removeById(collections.viewsRoutes, viewId);

        dbService.close();
        return true;
    }

    async getViewTemplate(viewId) {
        const dbService = await appInjector.get(appServices.dbService).connect();
        await dbService.getSingle(collections.viewsTemplates, {_id: viewId});
        dbService.close();
    }

    getTemplatesAction(htmlTemplate, css, js) {
        let action = {$set: {}};
        if (htmlTemplate)
            action.$set.html = htmlTemplate;
        if (css)
            action.$set.styles = css;
        if (js)
            action.$set.js = js;
        return action;
    }

    appandToAction(action, actionType, propName, value) {
        action[actionType][propName] = value;
    }
}