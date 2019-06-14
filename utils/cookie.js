'use strict';

module.exports = (res) => {
	const cookies = res.headers['set-cookie'];
	const filter = cookies.filter(cookie => {
			return cookie.indexOf('tndata=') === 0;
	});

	if(filter.length > 0) {
			return filter[0].split(';')[0];
	}
	return '';
};