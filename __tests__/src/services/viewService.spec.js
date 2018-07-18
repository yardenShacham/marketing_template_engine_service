import {appServices} from '../../../src/consts/appServices';
import {assert} from 'chai';
import {getInjector} from '../../../src';

describe('View Service Service', () => {
    let viewService = getInjector().get(appServices.viewsService);

    it('View Service service should start', () => {
        assert(!!viewService, "service not started");
    });

    it('View Service should create new view', () => {
        return viewService.createNewView("test view").then((viewId) => {
            assert(viewId, "view does not created");
        })
    });

});