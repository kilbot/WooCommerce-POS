POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Product = Backbone.DualModel.extend({
        idAttribute: 'local_id',
        remoteIdAttribute: 'id',

        parse: function (resp, options) {
            return resp.product ? resp.product : resp ;
        },

        validation: {
            sale_price: {
                pattern: 'email'
            }
        }
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

            //
            this.on( 'remote:sync', this.remoteSync );
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
        },

        remoteSync: function(){
            this.fullSync()
                .done( function() {

                })
                .fail( function( item, jqXHR, textStatus, errorThrown ){
                    // error alert
                    var errors = POS.Utils.parseErrorResponse( jqXHR );
                    POS.Components.Alerts.channel.command( 'open:alert', {
                        type: 'danger',
                        title: item.title,
                        message: errors
                    });
                });
        }

    });

    Entities.channel.reply('products', function() {
        return new Entities.Products();
    });

});