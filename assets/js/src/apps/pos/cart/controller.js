POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Controller = POS.Controller.Base.extend({

        initialize: function( options ) {

            this.layout = new Cart.Layout();

            this.listenTo( this.layout, 'show', function() {
                this.showCart();
            });

            this.show( this.layout, {
                region: POS.POSApp.layout.rightRegion,
                loading: {
                    entities: this.initCart( options )
                }
            });

        },

        initCart: function( options ) {
            var promise = $.Deferred(),
                orders = POS.Entities.channel.request('orders'),
                order;

            orders.once('idb:ready', function() {
                orders.fetchLocal().done( function(){
                    if( options.id ) {
                        order = orders.findWhere({ local_id: options.id });
                    } else if( orders.length > 0 ) {
                        order = orders.at(0);
                    } else {
                        order = orders.add();
                    }
                    this.getCartItems( order ).done( function( cart ) {

                        // attach local orders,
                        // this order and cart items
                        this.orders = orders;
                        this.order = order;
                        this.cart = cart;
                        promise.resolve();

                    }.bind(this));
                }.bind(this));
            }, this);

            return promise;
        },

        getCartItems: function( order ) {
            var promise = $.Deferred(),
                cart = POS.Entities.channel.request('cart', { order: order });

            cart.once('idb:ready', function() {
                cart.fetchOrder( order.id ).done( function(){
                    promise.resolve( cart );
                });
            });

            return promise;
        },

        showCart: function() {

            // show cart
            var view = new Cart.List({
                collection: this.cart
            });

            this.layout.listRegion.show( view );

            // add products to cart
            POS.POSApp.channel.comply( 'cart:add', function( model ) {
                var row = this.cart.findWhere({ id: model.attributes.id });
                if( row ) {
                    row.quantity('increase');
                } else {
                    //row = this.cart.create( model.attributes );
                    row = this.cart.add( model.attributes );
                }
                row.trigger( 'pulse:item' );
            }, this);

            // maybe show totals, actions
            if( true ) {
                this.showTotals();
                this.showActions();
            }
        },

        showTotals: function() {

            var view = new Cart.Totals({
                model: this.order
            });

            this.layout.totalsRegion.show( view );

        },

        showActions: function() {

            var view = new Cart.Actions({

            });

            this.layout.actionsRegion.show( view );
        }

    });

});