import {assert} from 'chai';
import {getInjector} from '../../src/app-injector';
import {appServices} from '../../src/consts/appServices';

describe('The Bootstrap prosess of the application ', () => {
    it('should return injector object with all ther services', () => {
        const injector = getInjector();
        const appExternalServices = Object.values(appServices);
        const isAllServiceRegistered = appExternalServices.find((serviceName) => !injector.get(serviceName)) === undefined;
        assert(isAllServiceRegistered, "not all services registerd currectly");
    });
});