POS.module('POSApp.Products', function(Products, POS, Backbone, Marionette, $, _) {

    Products.Controller = POS.Controller.Base.extend({

        initialize: function (options) {

            // init two column POS layout
            POS.POSApp.layout = new POS.POSApp.Layout();
            POS.mainRegion.$el.addClass('two-column');
            this.show( POS.POSApp.layout, { region: POS.mainRegion });

            // get product collection
            var products = POS.Entities.channel.request('products');

            // init products page layout
            this.layout = new Products.Layout();

            // wait for products to load
            this.listenTo( this.layout, 'show', function() {
                this.showFilter();
                this.showTabs();
                this.showProducts( products );
            });

            // make sure idb is ready
            products.once('idb:ready', function() {

                POS.Components.Loading.channel.command( 'show:loading', this.layout, {
                    region: POS.POSApp.layout.leftRegion,
                    loading: {
                        entities: products.fetch()
                    }
                });

            }, this);


        },

        showFilter: function() {
            var view = new Products.Filter();

            // show
            this.layout.actionsRegion.show( view );
        },

        showTabs: function() {

            // tabs component
            var view = POS.Components.Tabs.channel.request( 'get:tabs', POS.tabs );

            // show tabs component
            this.layout.tabsRegion.show( view );
        },

        showProducts: function( products ) {

            var filtered = new FilteredCollection( products );

            var view = new Products.List({
                collection: filtered
            });

            // add to cart
            this.listenTo( view, 'childview:cart:add:clicked', function(childview, args) {
                POS.POSApp.channel.command('cart:add', args.model);
            });

            // variations, new tab filter
            this.listenTo( view, 'childview:product:variations:clicked', function(childview, args) {
                var newTab = {
                    label: args.model.get('title'),
                    value: 'parent:' + args.model.get('id'),
                    fixed: false
                };
                this.trigger( 'add:new:tab', newTab );
            });

            // show
            this.layout.listRegion.show( view );

        },

        onDestroy: function() {
            // remove the POS layout
            delete POS.POSApp.layout;
            POS.mainRegion.$el.removeClass('two-column');
        }

    });

});