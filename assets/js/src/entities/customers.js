POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Customer = Backbone.DualModel.extend({
        urlRoot: function(){
            return POS.wc_api + 'customers';
        },

        parse: function (resp, options) {
            return resp.customer ? resp.customer : resp ;
        }
    });

    Entities.Customers = Backbone.DualCollection.extend({
        model: Entities.Customer,
        url: function(){
            return POS.wc_api + 'customers';
        },

        initialize: function(){
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'wc_pos_customers',
                dbVersion: 1,
                keyPath: 'id',
                //autoIncrement: true,
                indexes: [
                    //{name: 'local_id', keyPath: 'local_id', unique: true},  // same as idAttribute
                    //{name: 'id', keyPath: 'id', unique: true},  // same as remoteIdAttribute
                    //{name: 'status', keyPath: 'status', unique: false}  // required
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

        parseRecords: function (resp, options) {
            return resp.customers ? resp.customers : resp ;
        }
    });

    Entities.channel.reply('customer', function(id) {
        return new Entities.Customer(id);
    });

    Entities.channel.reply('customers', function() {
        return new Entities.Customers();
    });

});