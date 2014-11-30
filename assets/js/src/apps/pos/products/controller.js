POS.module('POSApp.Products', function(Products, POS, Backbone, Marionette, $, _) {

    Products.Controller = POS.Controller.Base.extend({

        initialize: function (options) {

            // init two column POS layout
            POS.mainRegion.twoColumns( this );

            // get product collection
            var products = POS.Entities.channel.request('products');

            // init products page layout
            this.layout = new Products.Layout();

            // wait for products to load
            this.listenTo( this.layout, 'show', function() {
                this.showFilter();
                this.showTabs();
                this.showProducts( products );

                // add title to tab
                this.region.leftRegion.trigger('update:title', 'Products');
            });

            // make sure idb is ready
            products.once('idb:ready', function() {

                this.show( this.layout, {
                    region: POS.mainRegion.leftRegion,
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

        }

    });

});