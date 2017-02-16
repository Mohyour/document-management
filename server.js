/* eslint-disable import/no-unresolved */

import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import route from './server/routes';



const port = parseInt(process.env.PORT, 10) || 5000;

// Set up express app
const app = express();

// Require routes in application.

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup a default catch-all route that sends back a welcome message in JSON format.
route(app);

app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}));
app.listen(port);
export default app;
