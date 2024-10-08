const express = require('express');
const app = express();
const getIpRoutes = require('./routes/getIp');
const cors = require("cors");
require("dotenv").config();

// CORS Middleware
app.use(cors());

// Route to retrieve external IP from https://www.npmjs.com/package/external-ip package
app.use('/', getIpRoutes);

module.exports = app;
