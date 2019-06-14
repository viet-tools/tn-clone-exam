'use strict';

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

const Login = require('./utils/login');
const getCookie = require('./utils/cookie');

const username = process.env.username;
const password = process.env.password;

if(!username || !password) {
	console.error('Must input username and password via env');
	process.exit(1);
}

const $ = require("jquery")(window);

const getLink = async (url, cookie) => {
	const res = await axios.get(url, {
		headers: {
			Cookie: cookie,
			Referer: 'https://hoc.trangnguyen.edu.vn',
			'Content-Type': 'application/json',
			Origin: 'https://trangnguyen.edu.vn',
			'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
		}
	});

	const html = res.data;
	const a = $(html).find('#root a');
	return a.attr('href');
}

(async () => {
	try {
		const resLogin = await Login(username, password);
		const resultLogin = resLogin.data;
		if(resultLogin.error === 0) {
			const cookie = getCookie(resLogin);
			if(cookie) {
				const links = await getLink('https://hoc.trangnguyen.edu.vn', cookie);
				console.log(links);
			}
		}
	} catch(e) {
		console.error(e);
	}
}) ();