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

// remove comments, eg: WP Super Cache
//var dataFilter = function(data, type){
//  if( type === 'json' ){
//    return data.replace(/<!--[\s\S]*?-->/g, '');
//  }
//  return data;
//};

var wrapOptions = function( options ){
  options = options || {};
  var error = options.error;

  // show error modal on error
  options.error = function(jqXHR, textStatus, errorThrown){
    if( textStatus === 'abort' ) {
      return;
    }
    if( error ) {
      error.apply(options.context, arguments);
    }
    var args = Array.prototype.slice.call(arguments);
    Radio.trigger('global', 'error', args);
  };

  return _.extend( options, {
    beforeSend: setHeaders
    //dataFilter: dataFilter,
    //timeout: 60000 // 60 seconds
  } );
};

module.exports = {

  /* jshint -W072, -W074 */
  ajax: function( url, data, callback, type, method ){
    if( _.isFunction(data) ){
      type = type || callback;
      callback = data;
      data = undefined;
    }

    var options = wrapOptions({
      url         : url,
      type        : method || 'get',
      dataType    : type,
      data        : data,

      success     : callback
    });

    // send data as request payload
    // @todo: check for options override
    if(method === 'post'){
      _.extend(options, {
        contentType : 'application/json',
        processData : false,
        data        : JSON.stringify(data)
      });
    }

    return $.ajax( options );
  },
  /* jshint +W072, +W074 */

  getJSON: function( url, data, callback ){
    return this.ajax( url, data, callback, 'json' );
  },

  post: function( url, data, callback ){
    return this.ajax( url, data, callback, 'json', 'post' );
  },

  // attach for use by sync config
  wrapAjaxOptions: wrapOptions

};