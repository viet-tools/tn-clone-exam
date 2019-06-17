'use strict';

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

const Login = require('./utils/login');
const getCookie = require('./utils/cookie');

const token = process.env.token;

