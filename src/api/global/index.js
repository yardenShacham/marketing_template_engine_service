import bodyParser from 'body-parser';

export default (app) => {
    app.use(bodyParser.urlencoded({msExtendedCode: true}));
    app.use(bodyParser.json());
};