POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Product = Backbone.DualModel.extend({
        urlRoot: function(){
            return POS.wc_api + 'products';
        },

        parse: function (resp, options) {
            return resp.product ? resp.product : resp ;
        }
    });

    Entities.Products = Backbone.DualCollection.extend({
        model: Entities.Product,
        url: function(){
            return POS.wc_api + 'products';
        },

        initialize: function(){
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'products',
                storePrefix: 'wc_pos_',
                dbVersion: 1,
                keyPath: 'id'
            }, this);
        },

        state: {
            pageSize: 10
        },

        parseState: function (resp, queryParams, state, options) {
            // totals are always in the WC API headers
            var totalRecords = parseInt(options.xhr.getResponseHeader('X-WC-Total'));
            var totalPages =parseInt(options.xhr.getResponseHeader('X-WC-TotalPages'));
            return {totalRecords: totalRecords, totalPages: totalPages};
        },

        parse: function (resp, options) {
            return resp.products ? resp.products : resp ;
        }

        //parseRecords: function (resp, options) {
        //    return resp.products ? resp.products : resp ;
        //}
    });

    Entities.channel.reply('product', function(id) {
        return new Entities.Product(id);
    });

    Entities.channel.reply('products', function() {
        return new Entities.Products();
    });

});