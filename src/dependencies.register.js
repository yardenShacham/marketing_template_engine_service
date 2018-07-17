import {injector} from 'jx-injector';
import {appServices} from './consts/appServices';
import {dbService} from "./services/dbService";


export const appInjector = new injector();

const registerAppDependencies = (appInjector) => {
    appInjector.register(appServices.dbService, dbService);
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