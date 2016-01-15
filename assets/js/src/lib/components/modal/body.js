var ItemView = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./body.hbs');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = ItemView.extend({
  template: hbs.compile(Tmpl),

  templateHelpers: function(){
    return _.extend({
      moreInfo: polyglot.t('titles.more-info')
    }, this.options );
  },

  ui: {
    raw: '*[data-action="raw"]',
    output: '.raw-output'
  },

  events: {
    'click @ui.raw': 'toggleRaw'
  },

  toggleRaw: function(e){
    e.preventDefault();
    this.ui.output.toggle();
  }

});