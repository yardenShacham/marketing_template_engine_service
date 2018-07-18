import {appServices} from '../consts/appServices';
import {collections} from '../consts/db';
import {getInstanceQuery} from '../Utils/db';
import {appInjector} from '../dependencies.register'

export class viewsService {

    async createNewView(viewName) {
        return await appInjector.get(appServices.dbService).connect()
            .insert(collections.views, {
                name: viewName,
                instances: []
            });
    }

    async appandViewTemplate(viewId, htmlTemplate, css, js) {
        await appInjector.get(appServices.dbService).connect()
            .insert(collections.viewsTemplates, {
                _id: viewId,
                html: htmlTemplate,
                css: css || null,
                js: js || null
            }, false, {upsert: true});
        await appInjector.get(appServices.viewInstanceService)
            .updateContentParams(viewId, htmlTemplate);
    }

    async getAllViews() {
        return await appInjector.get(appServices.dbService).connect()
            .getCollection(collections.views, null, null, {}).map((view) => ({
                viewId: view._id,
                name: view.name
            }));
    }

    async removeView(viewId) {
        await appInjector.get(appServices.dbService).connect()
            .removeById(collections.views, viewId);
        await appInjector.get(appServices.dbService).connect()
            .removeById(collections.viewsTemplates, viewId);
        await appInjector.get(appServices.dbService).connect()
            .removeById(collections.viewsRoutes, viewId);
        return true;
    }

    async getViewTemplate(viewId) {
        return await appInjector.get(appServices.dbService).connect()
            .getSingle(collections.viewsTemplates, {_id: viewId});
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