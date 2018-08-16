import registerGlobals from './global';
import registerGeneralSettings from './general-settings';
import registerViews from './view';
import registerViewInstance from './view-instance';
import registerInstanceContent from './instance-conetnt';

export default (app) => {
    registerGlobals(app);
    registerGeneralSettings(app);
    registerViews(app);
    registerViewInstance(app);
    registerInstanceContent(app);
};