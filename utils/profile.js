'use strict';
const axios = require('axios');

module.exports = async ($, cookie) => {
    const res = await axios.get('https://hoc.trangnguyen.edu.vn/ca-nhan', {
        headers: {
            Cookie: cookie,
            Referer: 'https://hoc.trangnguyen.edu.vn',
            Origin: 'https://trangnguyen.edu.vn',
            'User-Agent': 'Mozilla/10.0 (Windows NT 10.0) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/69.420 Safari/537.36'
        }
    });

    if (res.status !== 200) return null;

    const html = res.data;

    const form = $(html).find('.user-menu .dropdown-menu .user-header .media-body .row');

    return {
        user_id: parseInt($(form[0]).find('.label').text()),
        username: $(form[1]).find('.label').text(),
        class_id: parseInt($(form[2]).find('.label').text())
    }
};
