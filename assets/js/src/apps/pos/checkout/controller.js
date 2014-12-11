POS.module('POSApp.Checkout', function(Checkout, POS, Backbone, Marionette, $, _) {

    Checkout.Controller = POS.Controller.Base.extend({

        initialize: function( options ) {

            var orders = POS.Entities.channel.request('orders');

            this.layout = new Checkout.Layout();

            this.listenTo( this.layout, 'show', function() {
                this.showCheckout();
            });

            orders.once('idb:ready', function() {

                this.show( this.layout, {
                    region: options.region,
                    loading: {
                        entities: orders.fetch({ cart: true })
                    }
                });

            }, this);

        },

        showCheckout: function(){

        }

    });

});