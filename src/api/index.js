import registerGlobals from './global';
import registerViews from './view';
import registerViewInstance from './view-instance';
import registerInstanceContent from './instance-conetnt';

export default (app) => {
    registerGlobals(app);
    registerViews(app);
    registerViewInstance(app);
    registerInstanceContent(app);
};