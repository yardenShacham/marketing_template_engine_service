import bodyParser from 'body-parser';
import cors from 'cors';
export default (app) => {
    app.use(bodyParser.urlencoded({msExtendedCode: true}));
    app.use(bodyParser.json());
    app.use(cors());
};