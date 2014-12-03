POS.module('Entities.Orders', function(Orders, POS, Backbone, Marionette, $, _){

    Orders.Collection = Backbone.DualCollection.extend({
        model: Orders.Model,
        url: function(){
            return POS.wc_api + 'orders';
        },

        initialize: function( models, options ) {
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'orders',
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

        parse: function (resp, options) {
            return resp.orders ? resp.orders : resp ;
        },

        fetchLocalOrders: function(){
            var self = this;
            var onItem = function(item) {
                if( ! _( item).has('id') ) {
                    self.add(item);
                }
            }
            var onEnd = function() {
                self.trigger('orders:ready');
            };
            self.indexedDB.iterate(onItem, {
                index: 'local_id',
                order: 'ASC',
                onEnd: onEnd
            });
        }

    });

});