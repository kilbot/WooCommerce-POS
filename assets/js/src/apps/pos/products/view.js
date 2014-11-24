POS.module('POSApp.Products', function(Products, POS, Backbone, Marionette, $, _, Handlebars) {

    // global pos layout
    POS.POSApp.Layout = Marionette.LayoutView.extend({
        template: _.template('' +
            '<div id="left"></div>' +
            '<div id="right"></div>'
        ),
        regions: {
            leftRegion: '#left',
            rightRegion: '#right'
        }
    });

    // products module layout
    Products.Layout = Marionette.LayoutView.extend({
        template: _.template('' +
            '<div class="list-actions"></div>' +
            '<div class="list-tabs tabs infinite-tabs"></div>' +
            '<div class="list"></div>' +
            '<div class="list-footer"></div>'
        ),
        tagName: 'section',
        regions: {
            actionsRegion: '.list-actions',
            tabsRegion: '.list-tabs',
            listRegion: '.list'
        },
        attributes: {
            class: 'module products-module'
        }
    });

    /**
     * Filter
     */
    Products.Filter = Marionette.ItemView.extend({
        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-products-filter').html() );
        },

        behaviors: {
            Filter: {}
        }

    });

    /**
     * Single Product
     */
    Products.Item = Marionette.ItemView.extend({
        tagName: 'li',
        className: function(){ if( this.isVariable() ) return 'variable' },

        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-product').html() )
        },

        triggers: {
            'click .action-add' 		: 'cart:add:clicked',
            'click .action-variations' 	: 'product:variations:clicked'
        },

        onBeforeRender: function(){
            if( this.isVariable() ) { this.model.set('isVariable', true); }
        },

        isVariable: function() {
            if( this.model.get('type') === 'variable' ) { return true; }
        }

    });

    /**
     * Product Collection
     */
    Products.Empty = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'empty',
        template: '#tmpl-products-empty'
    });

    Products.List = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'striped',
        childView: Products.Item,
        emptyView: Products.Empty,

        initialize: function(options) {
            // this.on('all', function(e) { console.log("Product Collection View event: " + e); }); // debug
            this.collection.bind('request', this.ajaxStart, this);
            this.collection.bind('sync', this.ajaxComplete, this);
        },

        ajaxStart: function() {
            this.$el.css({ 'opacity': 0.5 });
        },

        ajaxComplete: function() {
            this.$el.removeAttr('style');
        }

    });

    /**
     * Pagination
     * TODO: store pagination and last update time in a viewModel?
     */
    Products.Pagination = Marionette.ItemView.extend({

        initialize: function() {
            this.template = Handlebars.compile( $('#tmpl-pagination').html() );
        },

        triggers: {
            'click a.sync'		: 'pagination:sync:clicked',
            'click a.destroy'	: 'pagination:clear:clicked'
        },

        events: {
            'click a.prev'		: 'previous',
            'click a.next'		: 'next'
        },

        collectionEvents: {
            'sync reset': 'render'
        },

        serializeData: function(){
            var state = _.clone(this.collection.state);

            if(Modernizr.indexeddb) {
                var last_update = new Date( parseInt( POS.Entities.channel.request('options:get', 'last_update') ) );
                state.last_update = last_update.getTime() > 0 ? last_update.toLocaleTimeString() : ' - ' ;
            }

            // calculate number of items on a page
            if(state.currentPage === state.lastPage) {
                state.currentRecords = state.totalRecords - (state.pageSize * (state.currentPage - 1));
            }
            else {
                state.currentRecords = state.pageSize;
            }

            // no results
            state.totalPages 	= state.totalPages ? state.totalPages : 1 ;
            state.totalRecords 	= state.totalRecords ? state.totalRecords : 0 ;

            return state;
        },

        previous: function(e) {
            e.preventDefault();
            if(this.collection.hasPreviousPage()) {
                this.collection.getPreviousPage();
            }
        },

        next: function(e) {
            e.preventDefault();
            if(this.collection.hasNextPage()) {
                this.collection.getNextPage();
            }
        }

    });

}, Handlebars);