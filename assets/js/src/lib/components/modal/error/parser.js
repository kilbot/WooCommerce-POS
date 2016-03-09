var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

/**
 *
 */
var parseResponseJSON = function( json ){
  var result = '';

  // rest api errors
  if( json.errors ){
    return _.map( json.errors, function( error ){
      return error.message;
    } );
  }

  return result;
};

/**
 *
 */
/* jshint -W071, -W074 */
var parseObject = function( obj ){
  var result = {
    title: obj.title || obj.name,
    message: obj.message
  };

  // looks like jqXHR
  if( obj.promise && obj.setRequestHeader ){
    result = {
      title   : obj.statusText !== 'OK' ? obj.statusText : '',
      message : obj.responseJSON ? parseResponseJSON( obj.responseJSON ) : '',
      raw     : obj.responseText
    };
  }

  // Error Events
  if( obj.target && obj.target.error ){
    result = {
      title: obj.target.error.name,
      message: obj.target.error.message
    };

    // special case Private Browsing
    if( result.title === 'InvalidStateError' ){
      result.message += ' ' + polyglot.t('messages.private-browsing');
    }
  }

  return result;
};
/* jshint +W071, +W074 */

/**
 *
 */
var parseArray = function( arr ){
  var result = {};

  // jqXHR
  if( _.isObject( arr[0] ) ){
    result = parseObject( arr[0] );
  }

  // text status
  if( _.isString( arr[1] ) && ! result.title ){
    result.title = arr[1];
  }

  // error thrown, eg: SyntaxError
  if( _.isError( arr[2] ) && ! result.message ){
    _.extend( result, parseObject( arr[2] ) );
  }

  return result;
};

module.exports = function(error){
  var result = {};

  // simple string error
  if( _.isString(error) ){
    result.message = error;
  }

  // arguments, eg: [ jqXHR, textStatus, errorThrown ]
  else if( _.isArray(error) ){
    result = parseArray(error);
  }

  // object error, eg: jqXHR
  else if( _.isObject(error) ){
    result = parseObject(error);
  }

  return result;
};