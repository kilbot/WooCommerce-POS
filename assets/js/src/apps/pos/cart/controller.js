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

            // listen for cart:add commands
            POS.POSApp.channel.comply( 'cart:add', this.addToCart, this);

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

        addToCart: function( item ) {
            var attributes = item instanceof Backbone.Model ? item.attributes : item;

            if( _.isUndefined( this.cart ) ) {
                POS.debugLog('error', 'There is no cart');
            }

            if( attributes.id ) {
                var row = this.cart.findWhere({ id: attributes.id });
            }

            if( row ) {
                row.quantity('increase');
            } else {
                row = this.cart.add( attributes );
            }

            row.trigger( 'focus:row' );
        },

        showCart: function() {

            // show cart
            var view = new Cart.Items({
                collection: this.cart
            });

            this.layout.listRegion.show( view );

            // maybe show totals, actions
            if( true ) {
                this.showTotals();
                this.showActions();
                this.showNotes();
            }
        },

        showTotals: function() {

            var view = new Cart.Totals({
                model: this.order
            });

            // toggle discount row
            this.on( 'discount:clicked', function() {
                view.showDiscountRow();
            });

            this.layout.totalsRegion.show( view );

        },

        // TODO: abstract as a collection of button models?
        showActions: function() {

            var view = new Cart.Actions();

            // void cart
            this.listenTo( view, 'void:clicked', function() {
                //_.invoke( this.items.toArray(), 'destroy' );
            });

            // add note
            this.listenTo( view, 'note:clicked', function() {
                this.trigger('note:clicked');
            });

            // cart discount
            this.listenTo( view, 'discount:clicked', function() {
                this.trigger('discount:clicked');
            });

            // add fee
            this.listenTo( view, 'fee:clicked', function(args) {
                var title = args.view.$('.action-fee').data('title');
                POS.POSApp.channel.command( 'cart:add', { title: title, type: 'fee' } );
            });

            // add shipping
            this.listenTo( view, 'shipping:clicked', function(args) {
                var title = args.view.$('.action-shipping').data('title');
                POS.POSApp.channel.command( 'cart:add', { title: title, type: 'shipping' } );
            });

            // checkout
            this.listenTo( view, 'checkout:clicked', function() {
                POS.POSApp.channel.command('show:checkout');
            });

            this.layout.actionsRegion.show( view );
        },

        showNotes: function() {

            var view = new Cart.Notes({
                model: this.order
            });

            // toggle note div
            this.on( 'note:clicked', function() {
                view.showNoteField();
            });

            // show
            this.layout.notesRegion.show( view );

        }

    });

});