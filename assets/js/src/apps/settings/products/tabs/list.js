var CompositeView = require('lib/config/composite-view');
var ItemView = require('lib/config/item-view');
var TabRow = require('./item');
var Sortable = require('lib/behaviors/sortable');
var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

var Empty = ItemView.extend({
  tagName: 'tr',
  className: 'empty',
  template: function(){
    return '<td colspan="4">' + polyglot.t('messages.no-product-tabs') + '</td>';
  }
});

module.exports = CompositeView.extend({

  childView: TabRow,

  childViewContainer: 'tbody',

  emptyView: Empty,

  childViewOptions: function(){
    if(!this.childTemplate){
      this.childTemplate = this.$('tbody tr').html();
      this.$('tbody').empty();
    }
    return {
      _template: this.childTemplate
    };
  },

  behaviors: {
    Sortable: {
      behaviorClass: Sortable,
      stop: function(event, ui){
        ui.item.removeAttr('style');
        $('input[data-name="order"]', this).each(function(idx) {
          $(this).val(idx);
          $(this).trigger('input');
        });
      }
    }
  },

  initialize: function(options){
    options = options || {};
    this.template = function() {
      return options._template;
    };
  },

  ui: {
    addTab : 'a[data-action="add-tab"]',
  },

  triggers: {
    'click @ui.addTab' : 'add:tab'
  },

  onAddTab: function(){
    this.collection.add({
      label: '',
      filter: ''
    });
  }

});