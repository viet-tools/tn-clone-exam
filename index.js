'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

const Login = require('./utils/login');
const getCookie = require('./utils/cookie');
const decode = require('./utils/decode');

const token = process.env.token;
const username = process.env.username;
const password = process.env.password;
let isUseToken = true;

const listLink = [];

if(!token && (!username || !password)) {
	console.error('Must input token or username and password via env');
	process.exit(1);
} else {
	if (token) {
		isUseToken = true;
	}
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

	if (res.status !== 200) return null;

	const html = res.data;

	const listA = $(html).find('#root a');
	if(listA.length > 0) {
		const results = [];
		for(let i = 0; i < listA.length; i++) {
			results.push($(listA[i]).attr('href'));
		}
		return results;
	} else {
		if (/https:\/\/hoc.trangnguyen.edu.vn\/luyen-tap\/[a-z\-]+$/.test(url)) {
			const results = [];
			const arr = url.split('/');
			arr.shift();
			arr.shift();
			arr.shift();
			const pathUrl = arr.join('/');
			for(let i = 1; i <= 19; i++) {
				results.push(`/${pathUrl}/vong-${i}`);
				results.push(`/${pathUrl}/vong-${i}/bai-1.html`);
				results.push(`/${pathUrl}/vong-${i}/bai-2.html`);
				results.push(`/${pathUrl}/vong-${i}/bai-3.html`);
			}
			return results;
		}
	}
	
	return null;
}

const getContent = async (url, cookie, link) => {
	console.log('Content: ', url);
	try {
		const res = await axios.get(url, {
			headers: {
				Cookie: cookie,
				Referer: 'https://trangnguyen.edu.vn',
				Origin: 'https://trangnguyen.edu.vn',
				'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
			}
		});
	
		if (res.status !== 200) return null;
	
		const newCookie = getCookie(res);

		const jsMatch = res.data.match(/<script async src="(web.min.js|game.min.js)"/i);
		if(jsMatch && jsMatch.length > 0) {
			// web.min.js | game.min.js
			const jsUrl = path.dirname(url) + '/' + jsMatch[1];
			const resGame = await axios.get(jsUrl, {
				headers: {
					Cookie: newCookie,
					Referer: url,
					Origin: 'https://trangnguyen.edu.vn',
					'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
				}
			});
	
			if (resGame.status !== 200) return null;
		
			// write file
			const examContent = decode(resGame);
			const filePath = path.join(__dirname, 'data', link.replace('.html', '.json'));
			fs.writeFileSync(filePath, examContent, {encoding: 'utf8', mode: 0o666, flag: 'w'});
		} else {
			console.log('not match', url, jsMatch)
		}
	} catch(e) {
		console.log(e.message);
	}	
};

const processLink = async (linkGet, cookie) => {
	console.log(linkGet);
	try {
		const links = await getLink(linkGet, cookie);

		if (links && links.length > 0) {
			for(let i = 0; i< links.length; i++) {
				const link = links[i];
				if(!listLink.includes(link)) {
					listLink.push(link);
					if(link.endsWith('.html')) {
						await getContent(`https://hoc.trangnguyen.edu.vn${link}`, cookie, link);
					} else {
						const dir = path.join(__dirname, 'data', link)
						if(!fs.existsSync(dir)) fs.mkdirSync(dir);
						await processLink(`https://hoc.trangnguyen.edu.vn${link}`, cookie);
					}
				}
			}
		}
	} catch (e) {
		console.log(e.message);
	}
};

(async () => {
	try {
		if (isUseToken) {
			await processLink('https://hoc.trangnguyen.edu.vn', `tndata=${token}`);
		} else {
			const resLogin = await Login(username, password);
			const resultLogin = resLogin.data;
			if(resultLogin.error === 0) {
				const cookie = getCookie(resLogin);
				if(cookie) {
					await processLink('https://hoc.trangnguyen.edu.vn', cookie);
				}
			}
		}
	} catch(e) {
		console.error(e.message);
	}
}) ();