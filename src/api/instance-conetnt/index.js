import InstanceContentRouter from './instance-conetnt-router';

export default (app) => {
    app.use('/instance-conetnt', InstanceContentRouter);
};