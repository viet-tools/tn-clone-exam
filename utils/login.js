'use strict';
const axios = require('axios');

module.exports = async (username, password) => {
    return await axios.post('https://trangnguyen.edu.vn/user/login', {
        username, password
    });
};
