var Model = require('lib/config/model');
var Radio = require('backbone.radio');
var $ = require('jquery');
var _ = require('lodash');

var formatName = function(user) {
  var name = _(user).pick(['first_name','last_name'])
    .values()
    .map(function( value ){
      return value.trim();
    })
    .compact()
    .value()
    .join(' ');

  return name || user.username;
};

var report = function(){
  return '*** Shop URL ***\n' +
    window.location.origin + '\n\n' +
    '*** Browser Info ***\n' +
    window.navigator.userAgent + '; ' + $('html').attr('class') + '\n\n';
};

module.exports = Model.extend({

  defaults: function(){
    var user = Radio.request('entities', 'get', {
        type: 'option',
        name: 'user'
      }) || {};

    return {
      name: formatName(user),
      email: user.email,
      message: '',
      append_report: true,
      report: report()
    };
  },

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'pos/support';
  },

  save: function(){
    var attrs = this.toJSON();
    if( !attrs.append_report ){
      attrs.report = undefined;
    }
    Model.prototype.save.call(this, attrs);
  }

});