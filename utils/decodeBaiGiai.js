'use strict';

const CryptoJS = require("crypto-js");

const getDataEnc = (content) => {
    return content.match(/var s=\'([a-zA-Z0-9\+\/\=]+)\';/i)[1];
};

module.exports = (res) => {
    const content = res.data;
    const dataEnc = getDataEnc(content);

    const lengthKey = parseInt(dataEnc.substring(dataEnc.length - 2))
    const key = dataEnc.substring(0, lengthKey);
    const data = CryptoJS.AES.decrypt(dataEnc.substring(lengthKey, dataEnc.length - 2), "MVT2017" + key).toString(CryptoJS.enc.Utf8);
    return data;
};