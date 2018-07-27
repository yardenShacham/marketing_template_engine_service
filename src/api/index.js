import registerGlobals from './global';
import registerViews from './view';
import registerViewInstance from './view-instance';

export default (app) => {
    registerGlobals(app);
    registerViews(app);
    registerViewInstance(app);
};