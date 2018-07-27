import viewRouter from './view-router';

export default (app) => {
    app.use('/views', viewRouter);
};