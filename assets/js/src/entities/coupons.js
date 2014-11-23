POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.Coupon = Backbone.DualModel.extend({
        urlRoot: function(){
            return POS.wc_api + 'coupons';
        },

        parse: function (resp, options) {
            return resp.coupon ? resp.coupon : resp ;
        }
    });

    Entities.Coupons = Backbone.DualCollection.extend({
        model: Entities.Order,
        url: function(){
            return POS.wc_api + 'coupons';
        },

        initialize: function(){
            this.indexedDB = new Backbone.IndexedDB({
                storeName: 'wc_pos_coupons',
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
            return resp.coupons ? resp.coupons : resp ;
        }
    });

    Entities.channel.reply('coupon', function(id) {
        return new Entities.Coupon(id);
    });

    Entities.channel.reply('coupons', function() {
        return new Entities.Coupons();
    });

});