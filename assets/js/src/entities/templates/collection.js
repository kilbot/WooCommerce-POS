var Collection = require('lib/config/collection');
var Model = require('./model');
var Radio = require('backbone.radio');

module.exports = Collection.extend({

  model: Model,

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + 'pos/templates';
  },

  fetchReceiptTemplate: function(){
    var self = this;

    if(!this.isNew()){
      return Promise.resolve( this.first() );
    }

    return this.fetch({
      data: {
        filter: {
          limit: 1,
          type: 'receipt'
        }
      }
    })
    .then(function(){
      return self.first();
    });
  }

});
