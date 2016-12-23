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
    // listen to keyPress events
    this.listenTo(Radio.channel('keypress'), 'scan:barcode', function(data){
      // remove prefix and suffix characters?
      this.barcodeModeOn();
      this.ui.searchField.val(data);
      this.ui.searchField.trigger('keyup').blur();
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
    this.ui.searchField.attr('placeholder', this.ui.searchBtn.text());
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

    /**
     * reset filters
     */
    this.collection
      .resetFilters()
      .fetch();

    this.trigger('mode:barcode', true);

    // change ui
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

    /**
     * reset filters
     */
    this.collection
      .resetFilters()
      .fetch();

    this.trigger('mode:barcode', false);

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