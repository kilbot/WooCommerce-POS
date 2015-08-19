var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./header.hbs');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = ItemView.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    var defaults = {
      title: polyglot.t('messages.loading'),
      close: polyglot.t('buttons.close')
    };
    this.data = _.defaults(options, defaults);
  },

  templateHelpers: function(){
    this.data.iconPrefix = window.adminpage ? 'wc_pos-icon' : 'icon';
    return this.data;
  },

  onUpdate: function(options){
    _.extend(this.data, options);
    this.render();
  }
});