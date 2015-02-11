var ItemView = require('lib/config/item-view');
var Tooltip = require('lib/components/tooltip/behavior');
var Tmpl = require('./hotkeys.hbs');
var hbs = require('handlebars');
var Radio = require('backbone.radio');

var View = ItemView.extend({
  template: hbs.compile(Tmpl),

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  initialize: function () {

  },

  templateHelpers: function(){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: 'hotkeys'
    });
  }

});