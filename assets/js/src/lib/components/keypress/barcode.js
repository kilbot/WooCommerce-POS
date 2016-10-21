// var Radio = require('backbone.radio');
var debug = require('debug')('barcodeParser');

// remove prefix or suffix chars
module.exports = function(data){
  this.channel.trigger('scan:barcode', data);
  debug('barcode detected', data);
  return data;
};