import {appServices} from '../../../src/consts/appServices';
import {assert} from 'chai';
import {appInjector} from '../../../src/app-injector';

describe('View Service Service', () => {
    let viewService = appInjector.get(appServices.viewsService);
    let viewInstanceService = appInjector.get(appServices.viewInstanceService);
    let createdViewId = null;
    let createdSecondViewId = null;
    const htmlTemplate = `<div><span>test</span></div>`;
    const htmlTemplateWithParams = `<div><span>{{test}}</span></div>`;
    const htmlTemplateWithParams2 = `<div>
                                         <span>{{test}}</span>
                                         <span>{{test2}}</span>
                                     </div>`;
    const cssStyles = `body{background:red}`;

    it('View Service service should start', () => {
        assert(!!viewService, "service not started");
    });

    it('View Service should create new view', () => {
        return viewService.createNewView("test view").then((viewId) => {
            createdViewId = viewId;
            assert(createdViewId, "view does not created");
        });
    });

    it('View Service should append new template', () => {
        return viewService.appendNewViewTemplate(createdViewId, htmlTemplate, cssStyles).then((isSuccses) => {
            assert(isSuccses, "view does not append new template");
        });
    });

    it('View instance Service should append new instance to view', () => {
        return viewInstanceService.appandNewViewInstance(createdViewId, "instance-test").then((instanceId) => {
            assert(instanceId, "instance does not created");
        });
    });

    it('View Service should append different template with params', () => {
        return viewService.updateViewTemplate(createdViewId, htmlTemplateWithParams).then((isSuccses) => {
            assert(isSuccses, "view does not created");
        });
    });

    it('View Service should append different template and update just the non existing params', () => {
        return viewService.updateViewTemplate(createdViewId, htmlTemplateWithParams2).then((isSuccses) => {
            assert(isSuccses, "view does not created");
        });
    });

    it('View Service should return all view', () => {
        return viewService.createNewView("test view 2").then((viewId) => {
            createdSecondViewId = viewId;
            return viewService.getAllViews().then((views) => {
                assert(views.length === 2, "there is missing view");
                assert(views[0].viewId && views[0].name, "there is missing parameters");
            });
        });
    });

    it('View Service should remove all test view', () => {
    /*    const removeTasks = [createdViewId, createdSecondViewId].map((viewId) => {
            return viewService.removeView(viewId);
        });

        return Promise.all(removeTasks).then(() => {
            const getViewDetails = [
                viewService.getViewTemplate(createdViewId),
                viewService.getView(createdViewId),
                viewService.getViewTemplate(createdSecondViewId),
                viewService.getView(createdSecondViewId)
            ];
            return Promise.all(getViewDetails).then((results) => {
                const isRemovedAll = !results.find((result) => result !== null);
                assert(isRemovedAll, "dont remove all related item to view")
            });
        })*/
    });

});