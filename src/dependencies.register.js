import {injector} from 'jx-injector';
import {appServices} from './consts/appServices';
import {dbService} from "./services/dbService";
import {viewsService} from "./services/viewsService";
import {viewInstanceService} from "./services/viewInstanceService";
import {templateEngineService} from "./services/templateEngineService";


const registerAppDependencies = (appInjector) => {
    appInjector.register(appServices.dbService, dbService);
    appInjector.register(appServices.viewsService, viewsService);
    appInjector.register(appServices.viewInstanceService, viewInstanceService);
    appInjector.register(appServices.templateEngineService, templateEngineService);
};


export const registerDependencies = () => {
    const appInjector = new injector();
    if (appInjector) {
        registerAppDependencies(appInjector);
        return appInjector;
    }
    else {
        throw new Error("rejector has does not exsit or have some problems");
    }
};