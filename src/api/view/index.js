import ViewRouter from './view-router';

export default (app) => {
    app.use('/views', ViewRouter);
};