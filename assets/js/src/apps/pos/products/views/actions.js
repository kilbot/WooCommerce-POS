var FilterView = require('lib/config/filter-view');
var POS = require('lib/utilities/global');

var Actions = FilterView.extend({
  template: '#tmpl-products-filter',

  keyEvents: {
    'barcode': 'toggleBarcodeMode'
  },

  ui: {
    modeIcon    : '*[data-toggle="dropdown"] i.icon',
    searchBtn   : '*[data-action="search"]',
    barcodeBtn  : '*[data-action="barcode"]',
    searchField : 'input[type=search]'
  },

  events: {
    'click @ui.searchBtn' : 'barcodeModeOff',
    'click @ui.barcodeBtn': 'barcodeModeOn'
  },

  onRender: function(){
    this.barcodeModeOff();
  },

  toggleBarcodeMode: function(){
    if(this.collection._mode === 'barcode'){
      return this.barcodeModeOff();
    }
    this.barcodeModeOn();
  },

  barcodeModeOn: function(e){
    if(e) { e.preventDefault(); }
    this.collection._mode = 'barcode';
    this.ui.modeIcon.removeClass('icon-search').addClass('icon-barcode');
    this.ui.searchField.attr('placeholder', this.ui.barcodeBtn.text());
  },

  barcodeModeOff: function(e){
    if(e) { e.preventDefault(); }
    this.collection._mode = undefined;
    this.ui.modeIcon.removeClass('icon-barcode').addClass('icon-search');
    this.ui.searchField.attr('placeholder', this.ui.searchBtn.text());
  }
});

module.exports = Actions;
POS.attach('POSApp.Products.Actions', Actions);