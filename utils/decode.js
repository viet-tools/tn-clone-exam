'use strict';

const CryptoJS = require("crypto-js");

const getUserId = (content) => {
    const match = content.match(/uid\:[ ]?\"(\d+)\"/i);
    if(match && match.length > 0) return match[1];
    return null;
};

const getDataEnc = (content) => {
    const ss = content.substring(content.lastIndexOf('('));
    const pos = ss.indexOf('"', 3);
    return ss.substring(2, pos);
};

module.exports = (res) => {
    const isGame = /.*\/game.min.js$/.test(res.config.url);
    const content = res.data;
    const userId = getUserId(content);
    const dataEnc = getDataEnc(content);

    const lengthKey = parseInt(dataEnc.substring(dataEnc.length - 2))
    const key = dataEnc.substring(0, lengthKey);
    const data = CryptoJS.AES.decrypt(dataEnc.substring(lengthKey, dataEnc.length - 2), "MVT2017" + key).toString(CryptoJS.enc.Utf8);
    return data;
};