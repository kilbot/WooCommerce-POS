/**
 * crude deleteDatabase functionality
 * @todo refactor with db checking
 */

var ItemView = require('lib/config/item-view');

module.exports =  ItemView.extend({

  dbs: [
    'wc_pos_products',
    'wc_pos_cart',
    'wc_pos_orders',
    'wc_pos_customers',
    'wc_pos_coupons'
  ],

  template: function(){
    return '<i class="wc_pos-icon-loading"></i>';
  },

  initialize: function (options) {
    options = options || {};

    this.modal = {
      header: {
        title: options.title
      },
      footer: {
        buttons: [{
          action: 'close',
          className: 'button'
        }]
      }
    };
  },

  ui: {
    loading: '.wc_pos-icon-loading'
  },

  onShow: function() {
    if(!window.indexedDB || !window.indexedDB.deleteDatabase){
      this.printToScreen('Browser does not support IndexedDB deleteDatabase!');
      return;
    }

    this.deleteDatabases();
  },

  printToScreen: function(str){
    this.ui.loading.before(str + ' ');
  },

  deleteDatabases: function(){
    var self = this;
    var dbName = this.dbs.shift();
    var DBDeleteRequest = window.indexedDB.deleteDatabase(dbName);

    DBDeleteRequest.onerror = function() {
      self.printToScreen('' +
        'Error deleting database, ' +
        'please make sure the POS is not open in another tab.'
      );
    };

    DBDeleteRequest.onsuccess = function() {

      // remove db version also
      window.localStorage.removeItem(dbName + '_idbVersion');

      if( self.dbs.length === 0 ){
        self.ui.loading.hide();
        self.printToScreen('All local data deleted successfully.');
      } else {
        self.printToScreen('.');
        self.deleteDatabases();
      }

    };
  }

});