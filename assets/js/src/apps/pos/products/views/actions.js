var View = require('lib/config/item-view');
var App = require('lib/config/application');
var Filter = require('lib/behaviors/filter');
var HotKeys = require('lib/behaviors/hotkeys');
var Radio = require('backbone.radio');
var Dropdown = require('lib/behaviors/dropdown');
var $ = require('jquery');

var Actions = View.extend({
  template: 'pos.products.filter',

  initialize: function(){
    var products = this.collection;
    var self = this;

    /**
     * match:barcode is triggered before filter is complete
     * this affects the filtered collection pagination
     * todo: refactor and fix this
     */
    this.listenTo(products.superset(), 'match:barcode', function(model){
      products.once('paginated:change:page', function(){
        self.triggerMethod('clear');
        self.ui.searchField.blur();
        self.ui.searchField.focus();
      });
      Radio.request('router', 'add:to:cart', model);
    });
  },

  behaviors: {
    Filter: {
      behaviorClass: Filter
    },
    HotKeys: {
      behaviorClass: HotKeys
    },
    Dropdown: {
      behaviorClass: Dropdown
    }
  },

  keyEvents: {
    'search'  : 'barcodeModeOff',
    'barcode' : 'barcodeModeOn'
  },

  ui: {
    modeIcon    : '*[data-toggle="dropdown"] i',
    searchBtn   : '*[data-action="search"]',
    barcodeBtn  : '*[data-action="barcode"]',
    searchField : 'input[type=search]'
  },

  onRender: function(){
    this.barcodeModeOff();
  },

  onDropdownSelect: function(e){
    if( $(e.currentTarget).data('action') === 'barcode' ){
      return this.barcodeModeOn();
    }
    this.barcodeModeOff();
  },

  toggleBarcodeMode: function(){
    if(this._mode === 'barcode'){
      return this.barcodeModeOff();
    }
    this.barcodeModeOn();
  },

  barcodeModeOn: function(e){
    if(e) { e.preventDefault(); }
    this._mode = 'barcode';
    this.ui.modeIcon
      .removeClass('icon-search')
      .addClass('icon-barcode');
    this.ui.searchField
      .attr('placeholder', this.ui.barcodeBtn.text())
      .focus()
      .trigger('keyup');
  },

  barcodeModeOff: function(e){
    if(e) { e.preventDefault(); }
    this._mode = undefined;
    this.ui.modeIcon
      .removeClass('icon-barcode')
      .addClass('icon-search');
    this.ui.searchField
      .attr('placeholder', this.ui.searchBtn.text())
      .focus()
      .trigger('keyup');
  }
});

module.exports = Actions;
App.prototype.set('POSApp.Products.Actions', Actions);
