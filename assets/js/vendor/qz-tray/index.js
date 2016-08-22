var qz = require('qz-tray.js');
var SHA256 = require('sha-256.js');

qz.setPromiseType(window.Promise);
qz.setSha256Type(SHA256);

module.exports = qz;