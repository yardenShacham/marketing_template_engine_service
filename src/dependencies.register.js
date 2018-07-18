import {injector} from 'jx-injector';
import {appServices} from './consts/appServices';
import {dbService} from "./services/dbService";
import {viewsService} from "./services/viewsService";
import {viewInstanceService} from "./services/viewInstanceService";


export const appInjector = new injector();

const registerAppDependencies = (appInjector) => {
    appInjector.register(appServices.dbService, dbService);
    appInjector.register(appServices.viewsService, viewsService);
    appInjector.register(appServices.viewInstanceService, viewInstanceService);
};



export const registerDependencies = () => {
    if (appInjector) {
        registerAppDependencies(appInjector);
        return appInjector;
    }
    else {
        throw new Error("rejector has does not exsit or have some problems");
    }
};