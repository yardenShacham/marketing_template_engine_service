import startAppInjector from './src/app-injector';
import express from 'express';
import startApp from './src/api';

const app = express();
startApp(app);
const port = 3000;
app.listen(port);
console.log('listening on port ', port);