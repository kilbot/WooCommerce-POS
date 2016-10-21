/**
 * wrapper for $.ajax
 */

var $ = require('jquery');
var Radio = require('backbone.radio');
var _ = require('lodash');

var setHeaders = function(xhr){
  xhr.setRequestHeader('X-WC-POS', 1);
  if( window.wc_pos_admin ){
    // note: using headers rather than query params
    xhr.setRequestHeader('X-WC-POS-ADMIN', window.wc_pos_admin);
  }
};

var onError = function(){
  var args = Array.prototype.slice.call(arguments);
  Radio.trigger('global', 'error', args);
};

// remove comments, eg: WP Super Cache
//var dataFilter = function(data, type){
//  if( type === 'json' ){
//    return data.replace(/<!--[\s\S]*?-->/g, '');
//  }
//  return data;
//};

var ajaxSetup = function( options ){
  return _.extend( options, {
    beforeSend: setHeaders
    //dataFilter: dataFilter,
    //timeout: 60000 // 60 seconds
  } );
};

module.exports = {

  /* jshint -W072 */
  ajax: function( url, data, callback, type, method ){
    if( _.isFunction(data) ){
      type = type || callback;
      callback = data;
      data = undefined;
    }

    var options = ajaxSetup({
      url       : url,
      type      : method || 'get',
      dataType  : type,
      data      : data,
      success   : callback,
      error     : onError
    });

    return $.ajax( options );
  },
  /* jshint +W072 */

  getJSON: function( url, data, callback ){
    return this.ajax( url, data, callback, 'json' );
  },

  post: function( url, data, callback ){
    return this.ajax( url, data, callback, 'json', 'post' );
  },

  // attach for use by bb.sync config
  ajaxSetup: ajaxSetup,
  onError: onError

};