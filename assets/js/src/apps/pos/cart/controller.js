POS.module('POSApp.Cart', function(Cart, POS, Backbone, Marionette, $, _) {

    Cart.Controller = POS.Controller.Base.extend({

        initialize: function( options ) {
            this.id = options.id;

            // load the cart
            this.layout = new Cart.Layout();

            // add title to tab
            this.updateTabLabel();

            this.listenTo( this.layout, 'show', function() {
                this.showCart();
                this.showTotals();
                this.showCustomer();
                this.showActions();
                this.showNotes();
            });

            this.show( this.layout, {
                region: options.region,
                loading: {
                    entities: this.getOrders()
                }
            });

            // listen for cart:add commands
            POS.POSApp.channel.comply( 'cart:add', this.addToCart, this);

        },

        /**
         *
         */
        getOrders: function() {
            var promise = $.Deferred();

            // init orders collection
            this.orders = POS.Entities.channel.request('orders');

            // fetch collection of local orders
            this.orders.once('idb:ready', function() {
                this.orders.fetchLocalOrders();
            }, this);

            // fetch order
            this.orders.once('orders:ready', function(){
                this.getOrder( this.id );
            }, this);

            // finished setting up cart
            this.on('cart:ready', function(){
                promise.resolve();
            });

            return promise;
        },

        getOrder: function( id ) {

            if( id ) {
                // get order by id
                this.order = this.orders.findWhere({ local_id: this.id });
            } else if( this.orders.length > 0 ) {
                // get first order
                this.order = this.orders.at(0);
            } else {
                // new order
                this.order = this.orders.add({ local_id: '' });
            }

            // add listener to order to update tab label
            this.listenTo( this.order, 'change:total', this.updateTabLabel );

            this.getCart( this.order );
        },

        /**
         *
         */
        getCart: function( order ) {
            this.cart = POS.Entities.channel.request('cart', { order: order });

            this.cart.once('idb:ready', function() {
                this.cart.fetchOrder();
            }, this);

            this.listenTo( this.cart, 'cart:ready', function() {
                this.trigger('cart:ready');
            });
        },

        /**
         * Add/update tab label
         */
        updateTabLabel: _.debounce( function( order ) {
            var label = $('#tmpl-cart').data('title');
            if( order ){
                /* global accounting */
                label += ' - ' + accounting.formatMoney( order.get('total') );
            }
            POS.channel.command( 'update:tab:label', label, 'right' );
        }, 100),

        /**
         *
         */
        addToCart: function( item ) {
            var attributes = item instanceof Backbone.Model ? item.attributes : item;
            var row;

            if( _.isUndefined( this.cart ) ) {
                POS.debugLog('error', 'There is no cart');
            }

            if( attributes.id ) {
                row = this.cart.findWhere({ id: attributes.id });
            }

            if( row instanceof Backbone.Model ) {
                row.quantity('increase');
            } else {
                row = this.cart.add( attributes );
            }

            row.trigger( 'focus:row' );
        },

        /**
         *
         */
        showCart: function() {

            // show cart
            var view = new Cart.Items({
                collection: this.cart
            });

            this.layout.listRegion.show( view );
        },

        /**
         *
         */
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

        /**
         *
         */
        showCustomer: function(){
            var view = POS.Components.Customer.channel.request('customer:select');

            this.listenTo( view, 'customer:select', function( id, name ) {
                this.order.save({
                    customer_id: id,
                    customer_name: name
                });
            }, this);

            // bit of a hack
            // get the "Customer:" translation and add it to the view
            this.layout.customerRegion.on( 'before:show', function(view){
                var label = this.$el.html();
                view.$el.prepend( label );
            });

            this.layout.customerRegion.show( view );
        },

        /**
         * TODO: abstract as a collection of button models?
         */
        showActions: function() {

            var view = new Cart.Actions();

            // void cart
            this.listenTo( view, 'void:clicked', function() {
                _.invoke( this.cart.toArray(), 'destroy' );
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

        /**
         *
         */
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