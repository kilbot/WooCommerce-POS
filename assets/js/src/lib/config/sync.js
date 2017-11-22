// some nice features may be:
// - queue which prioritises tasks
// - retry for server timeouts

// DO NOT include this file in wp-admin
// changes are made to the global $.ajax & bb.sync

var bb = require('backbone');
var Radio = require('backbone.radio');
var _ = require('lodash');
bb.idbSync = require('./idb/src/sync');
bb.ajaxSync = bb.sync;

// set jquery ajax globals
bb.$.ajaxSetup({
  data: {
    security: function(){
      return Radio.request('entities', 'get', {
        type: 'option',
        name: 'nonce'
      });
    }
  },
  // for straight jquery ajax calls
  beforeSend: function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
  },
  timeout: 50000 // 50 seconds
});

// global ajax error handler
bb.$( document ).ajaxError(function( event, jqXHR, ajaxSettings, thrownError ) {
  Radio.trigger('global', 'error', {
    jqXHR       : jqXHR,
    thrownError : thrownError
  });
});

// override Backbone.sync
bb.sync = function(method, entity, options) {
  // idb
  if(!options.remote &&
    (entity.db || (entity.collection && entity.collection.db))){
    return bb.idbSync.apply(this, [method, entity, options]);
  }
  // server
  options.beforeSend = function(xhr){
    xhr.setRequestHeader('X-WC-POS', 1);
    var rest_nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'rest_nonce'
    });
    xhr.setRequestHeader('X-WP-Nonce', rest_nonce);
  };
  // hack to remove status
  if(method === 'create' || method === 'update'){
    entity.unset('status', { silent: true });
    var regular_price = entity.get('regular_price');
    var sale_price = entity.get('sale_price');

    if(regular_price !== undefined) {
      entity.set({ 'regular_price': regular_price + '' }, {silent: true});
    }
    if(sale_price !== undefined) {
      entity.set({ 'sale_price': sale_price + '' }, {silent: true});
    }

    // hack for WP 4.9 compat
    var line_items = entity.get('line_items');
    if( line_items !== undefined ) {
      var items = [];
      _.each(line_items, function(line_item){
        _.set(line_item, 'price', _.get(line_item, 'price') + '');
        _.set(line_item, 'subtotal', _.get(line_item, 'subtotal') + '');
        _.set(line_item, 'subtotal_tax', _.get(line_item, 'subtotal_tax') + '');
        _.set(line_item, 'total_tax', _.get(line_item, 'total_tax') + '');
        _.set(line_item, 'total', _.get(line_item, 'total') + '');
        items.push( line_item );
      });
      entity.set({ 'line_items': items }, {silent: true});
    }

    var shipping_lines = entity.get('shipping_lines');
    if( shipping_lines !== undefined ) {
      var items = [];
      _.each(shipping_lines, function(shipping_line){
        _.set(shipping_line, 'price', _.get(shipping_line, 'price') + '');
        _.set(shipping_line, 'subtotal', _.get(shipping_line, 'subtotal') + '');
        _.set(shipping_line, 'subtotal_tax', _.get(shipping_line, 'subtotal_tax') + '');
        _.set(shipping_line, 'total_tax', _.get(shipping_line, 'total_tax') + '');
        _.set(shipping_line, 'total', _.get(shipping_line, 'total') + '');
        items.push( shipping_line );
      });
      entity.set({ 'shipping_lines': items }, {silent: true});
    }

    var fee_lines = entity.get('fee_lines');
    if( fee_lines !== undefined ) {
      var items = [];
      _.each(fee_lines, function(fee_line){
        _.set(fee_line, 'price', _.get(fee_line, 'price') + '');
        _.set(fee_line, 'subtotal', _.get(fee_line, 'subtotal') + '');
        _.set(fee_line, 'subtotal_tax', _.get(fee_line, 'subtotal_tax') + '');
        _.set(fee_line, 'total_tax', _.get(fee_line, 'total_tax') + '');
        _.set(fee_line, 'total', _.get(fee_line, 'total') + '');
        items.push( fee_line );
      });
      entity.set({ 'fee_lines': items }, {silent: true});
    }
  }
  // hack for updating products
  if(method === 'patch' && options.attrs) {
    if(options.attrs.status) {
      options.attrs.status = undefined;
    }
    if(options.attrs.regular_price){
      options.attrs.regular_price+='';
    }
    if(options.attrs.sale_price){
      options.attrs.sale_price+='';
    }
  }

  return bb.ajaxSync.apply(this, [method, entity, options]);
};