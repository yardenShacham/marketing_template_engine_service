import ViewInstanceRouter from './view-instance-router';

export default (app) => {
    app.use('/view-instances', ViewInstanceRouter);
};