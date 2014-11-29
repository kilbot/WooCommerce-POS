POS.module('POSApp.Receipt', function(Receipt, POS, Backbone, Marionette, $, _) {

    Receipt.Controller = POS.Controller.Base.extend({

        initialize: function( options ) {

            var orders = POS.Entities.channel.request('orders');

            this.layout = new Receipt.Layout();

            this.listenTo( this.layout, 'show', function() {
                this.showReceipt();
            });

            orders.once('idb:ready', function() {

                this.show( this.layout, {
                    region: POS.mainRegion.rightRegion,
                    loading: {
                        entities: orders.fetch({ cart: true })
                    }
                });

            }, this);

        },

        showReceipt: function() {

        }

    });

});