import GeneralSettingsRouter from './general-settings-router';

export default (app) => {
    app.use('/general-settings', GeneralSettingsRouter);
};