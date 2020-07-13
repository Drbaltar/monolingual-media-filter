/*
*  This module is the entry point for the Express server used to serve the 
*  endpoints used to request filtering of video, audio and subtitle tracks
*  that do not match the user's desired language via webhooks
*  Author: Kyle McCain
*  Date: 8 July 2020
*/

// Add environmental variables
require('dotenv').config();

// Set up express variables
const express = require('express');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');

// Allow express to parse incoming JSON
app.use(bodyParser.json());

// Add routes
const singleFileRouter = require('./routes/singleFileInput');

// Set all routes
app.use('/singleFileInput', singleFileRouter);

// Set server to start listening on specified port
app.listen(port, () => console.log(`Monolingual Media Filter listening on port ${port}`));