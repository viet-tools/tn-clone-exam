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
const decodebaiGiai = require('./utils/decodeBaiGiai');
const Profile = require('./utils/profile');

const token = process.env.token;
const username = process.env.username;
const password = process.env.password;
let isUseToken = true;

axios.baseURL = 'https://hoc.trangnguyen.edu.vn';

const listLink = [];
const listDownload = [];

if(!token && (!username || !password)) {
	console.error('Must input token or username and password via env');
	process.exit(1);
} else {
	if (token) {
		isUseToken = true;
	}
}

const $ = require("jquery")(window);

const download = async (url) => {
	console.log('Download file:', url);
	try {
		if(url.indexOf('http://') !== 0 || url.indexOf('https://') !== 0) {
			if(url.indexOf('/') === 0) {
				url = `https://hoc.trangnguyen.edu.vn${url}`;
			} else {
				url = `https://hoc.trangnguyen.edu.vn/${url}`;
			}
		}
		const res = await axios.get(url, { 
			responseType: 'arraybuffer',
			headers: {
				Referer: 'https://hoc.trangnguyen.edu.vn',
				'Content-Type': 'application/json',
				Origin: 'https://trangnguyen.edu.vn',
				'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
			}
		});
		if (res.status !== 200) return null;
		const urlPath = res.request.path;
		const filePath = path.join(__dirname, 'data', urlPath);
		const dir = path.dirname(filePath);
		if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
		fs.writeFileSync(filePath, res.data);
	} catch (e) {
		console.error(e.message);
	}
};

const getLink = async (url, cookie, userInfo) => {
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
	const $dom = $(html);

	const listA = $dom.find('#root a');
	if(listA.length > 0) {
		const results = [];
		for(let i = 0; i < listA.length; i++) {
			results.push($(listA[i]).attr('href'));
		}
		return results;
	} else {
		const arr = url.split('/');
		arr.shift();
		arr.shift();
		arr.shift();
		const pathUrl = arr.join('/');

		if (/https:\/\/hoc.trangnguyen.edu.vn\/luyen-tap\/[a-z\-]+$/.test(url)) {
			const subject_info = html.match(/var subject_info = (\{.*\});/i);

			const results = [];
			
			if (subject_info.length > 0) {
				const pathStorage = path.join(__dirname, 'data', userInfo.class_id.toString(), pathUrl);
				if(!fs.existsSync(pathStorage)) fs.mkdirSync(pathStorage, {recursive: true});
				fs.writeFileSync(path.join(pathStorage, 'index.json'), subject_info[1]);
			}
			
			for(let i = 1; i <= 19; i++) {
				// results.push(`/${pathUrl}/vong-${i}`);
				const pathStorage = path.join(__dirname, 'data', userInfo.class_id.toString(), `${pathUrl}/vong-${i}`);
				if(!fs.existsSync(pathStorage)) fs.mkdirSync(pathStorage, {recursive: true});

				results.push(`/${pathUrl}/vong-${i}/bai-1.html`);
				results.push(`/${pathUrl}/vong-${i}/bai-2.html`);
				results.push(`/${pathUrl}/vong-${i}/bai-3.html`);
			}
			return results;
		} else if (/https:\/\/hoc.trangnguyen.edu.vn\/bai-giai\/[a-z\-]+$/.test(url)) {
			const wells = $dom.find('.well');
			if(wells.length > 0) {
				const list = [];
				const results = [];
				for(let i = 0; i < wells.length; i++) {
					const well = wells[i];
					const a = $(well).find('.media >a');
					const href = $(a).attr('href');
					const imgSrc = $(a).find('img').attr('src');
					const examName = $(well).find('.media .media-body h4').text()
					list.push({
						name: examName,
						thumb: imgSrc,
						link: href
					});
					listDownload.push(imgSrc);
					results.push(href);
				}

				if (list.length > 0) {
					const pathStorage = path.join(__dirname, 'data', userInfo.class_id.toString(), pathUrl);
					if(!fs.existsSync(pathStorage)) fs.mkdirSync(pathStorage, {recursive: true});
					fs.writeFileSync(path.join(pathStorage, 'index.json'), JSON.stringify(list));
				}

				return results;
			}
		}
	}
	
	return null;
}

const getContent = async (url, cookie, link, userInfo) => {
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
			const filePath = path.join(__dirname, 'data', userInfo.class_id.toString(), link.replace('.html', '.json'));
			fs.writeFileSync(filePath, examContent, {encoding: 'utf8', mode: 0o666, flag: 'w'});

			// queue download file listDownload
			const dataJson = JSON.parse(examContent);
			if(dataJson.game_id > 0) {
				dataJson.content.forEach(item => {
					if(item.type === 'image' && !listDownload.includes(item.content)) listDownload.push(item.content);
				});
			} else {
				dataJson.content.forEach(item => {
					const pos = item.question.indexOf('{img:');
					if(pos >=  0) {
						const pos2 = item.question.indexOf('}', pos + 5);
						if (pos2 >= 0) {
							const src = item.question.substring(pos + 5, pos2);
							if(!listDownload.includes(src)) listDownload.push(src);
						}
					}
				});
			}
		} else {
			console.log('not match', url, jsMatch)
		}
	} catch(e) {
		console.log(e.message);
	}
};

const getImgSrc = (content) => {
	try {
		const imgs = $(`<div>${content}</div>`).find('img');
		if(imgs.length > 0) {
			const list = [];
			for(let i = 0; i< imgs.length; i++) {
				list.push($(imgs[i]).attr('src'));
			}
			return list;
		}
		return null;
	} catch (e) {
		console.error('>>', e.message, content);
		process.exit(1);
	}
};

const getContentBaiGiai = async (url, cookie, link, userInfo) => {
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

		// play.min.js
		const resGame = await axios.get('https://hoc.trangnguyen.edu.vn/bai-giai/tieng-viet/play.min.js', {
			headers: {
				Cookie: newCookie,
				Referer: url,
				Origin: 'https://trangnguyen.edu.vn',
				'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
			}
		});

		if (resGame.status !== 200) return null;
	
		// write file
		const examContent = decodebaiGiai(resGame);
		const filePath = path.join(__dirname, 'data', userInfo.class_id.toString(), link.replace('.html', '.json'));
		fs.writeFileSync(filePath, examContent, {encoding: 'utf8', mode: 0o666, flag: 'w'});

		// queue download file listDownload
		const dataJson = JSON.parse(examContent);
		dataJson.content.forEach(item => {
			let listImg = [];
			listImg = listImg.concat(getImgSrc(item.question));
			listImg = listImg.concat(getImgSrc(item.the_answer));

			if(item.type === '2') {
				listImg = listImg.concat(getImgSrc(item.answered));
			} else {
				listImg = listImg.concat(getImgSrc(item.answer[0]));
				listImg = listImg.concat(getImgSrc(item.answer[1]));
				listImg = listImg.concat(getImgSrc(item.answer[2]));
				listImg = listImg.concat(getImgSrc(item.answer[3]));
			}
		
			listImg.forEach(src => {
				if(src && !listDownload.includes(src)) listDownload.push(src);
			});
		});
	} catch(e) {
		console.log(e.message);
	}
};

const processLink = async (linkGet, cookie, userInfo) => {
	console.log(linkGet);
	try {
		const links = await getLink(linkGet, cookie, userInfo);

		if (links && links.length > 0) {
			for(let i = 0; i< links.length; i++) {
				const link = links[i];
				if(!listLink.includes(link)) {
					listLink.push(link);
					if(link.endsWith('.html')) {
						if(link.indexOf('/luyen-tap/') === 0) {
							await getContent(`https://hoc.trangnguyen.edu.vn${link}`, cookie, link, userInfo);
						} else if(link.indexOf('/bai-giai/') === 0) {
							await getContentBaiGiai(`https://hoc.trangnguyen.edu.vn${link}`, cookie, link, userInfo);
						}
					} else {
						const dir = path.join(__dirname, 'data', userInfo.class_id.toString(), link);
						if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
						await processLink(`https://hoc.trangnguyen.edu.vn${link}`, cookie, userInfo);
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
			const userInfo = await Profile($, `tndata=${token}`);
			if (userInfo) {
				await processLink('https://hoc.trangnguyen.edu.vn', `tndata=${token}`, userInfo);
			} else {
				console.log('Token error');
			}
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

		if(listDownload.length > 0) {
			for(const link of listDownload) {
				await download(link);
			}
		}
	} catch(e) {
		console.error(e.message);
	}
}) ();