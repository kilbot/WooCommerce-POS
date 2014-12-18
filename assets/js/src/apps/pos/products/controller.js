POS.module('POSApp.Products', function(Products, POS, Backbone, Marionette, $, _) {

    Products.Controller = POS.Controller.Base.extend({

        initialize: function (options) {

            // init two column POS layout
            this.columnsLayout = POS.mainRegion.twoColumns( this );

            this.listenTo( this.columnsLayout, 'show', function() {
                this.initProducts();
            });

            // show
            this.show( this.columnsLayout, { region: POS.mainRegion } );

        },

        initProducts: function() {

            var products = POS.Entities.channel.request('products');

            this.layout = new Products.Layout();

            // add title to tab
            // super hack, get the label from the menu
            // TODO: put menu items into params, remove this hack
            POS.channel.command( 'update:tab:label', $('#menu li.products').text(), 'left' );

            // wait for products to load
            this.listenTo( this.layout, 'show', function() {

                var filtered = new FilteredCollection( products );
                this.showActions( filtered );
                this.showTabs( filtered );
                this.showProducts( filtered );
            });

            // make sure idb is ready
            products.once('idb:ready', function() {

                POS.Components.Loading.channel.command( 'show:loading', this.layout, {
                    region: this.columnsLayout.leftRegion,
                    loading: {
                        entities: products.fetch()
                    }
                });

            }, this);
        },

        showActions: function( filtered ) {
            var view = new Products.Actions({ collection: filtered });

            this.listenTo( view, 'stuff', function(){

            });

            // show
            this.layout.actionsRegion.show( view );
        },

        showTabs: function( filtered ) {

            // tabs component
            var view = POS.Components.Tabs.channel.request( 'get:tabs', POS.getOption('tabs') );

            this.listenTo( view.collection, 'change:active', function( model ){
                var criterion = POS.Components.SearchParser.channel.request( 'facets', model.get('value') );
                var fields = ['title'];
                filtered.filterBy( 'tab',
                    //_.bind( filtered.matchMaker, filtered, criterion, fields )
                    _.partial( filtered.matchMaker, criterion, fields )
                );
            });

            // listen for new tabs
            this.on( 'add:new:tab', function(tab) {
                view.collection.add( tab ).set({ active: true });
            });

            // show tabs component
            this.layout.tabsRegion.show( view );
        },

        showProducts: function( filtered ) {

            var view = new Products.List({ collection: filtered });

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