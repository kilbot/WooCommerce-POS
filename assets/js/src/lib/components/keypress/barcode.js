// var Radio = require('backbone.radio');
var debug = require('debug')('barcodeParser');

module.exports = function(data){
  this.channel.trigger('scan:barcode', data);
  debug('barcode detected', data);
  return data;
};