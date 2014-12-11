POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Product = Backbone.DualModel.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id'
    });

    Entities.Products = Backbone.DualCollection.extend({
        model: Entities.Product,
        url: function(){
            return POS.getOption('wc_api') + 'products';
        },

        initialize: function(){
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'products',
                storePrefix: 'wc_pos_',
                dbVersion: 1,
                keyPath: 'local_id',
                autoIncrement: true,
                indexes: [
                    {name: 'local_id', keyPath: 'local_id', unique: true},  // same as idAttribute
                    {name: 'id', keyPath: 'id', unique: true},  // same as remoteIdAttribute
                    {name: 'status', keyPath: 'status', unique: false}  // required
                ]
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

    });

    Entities.channel.reply('products', function() {
        return new Entities.Products();
    });

});