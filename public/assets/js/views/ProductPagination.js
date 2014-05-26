define(['jquery', 'underscore', 'backbone', 'settings'], 
	function($, _, Backbone, Settings) {

	// view handles the pagination and page info
	var ProductPagination = Backbone.View.extend({
		el: $('#pagination'),
		template: _.template($('#tmpl-pagination').html()),
		fallbackTemplate: _.template($('#tmpl-fallback-pagination').html()),

		initialize: function() {

			this.collection.on( 'sync reset', this.render, this );
			this.render();
		},
	
		events: {
			'click a.prev'		: 'previous',
			'click a.next'		: 'next',
			'click a.sync'		: 'sync',
			'click a.destroy'	: 'destroy',
		},
		
		render: function() {
			var state;

			if(Modernizr.indexeddb) {
				state = this.collection.state;
				state.currentRecords = this.collection.length;

				// add the last updated time from localstorage
				var last_update = new Date( parseInt( Settings.get('last_update') ) );
				state.last_update = last_update.getTime() > 0 ? last_update.toLocaleTimeString() : 'never' ;
				
				// now render
				this.$el.html( ( this.template( state ) ) );
				this.$el.prepend( '<span></span> ' ); // add a span for 'working' animation
			}

			else {
				state = this.collection.state;
				if(state.currentPage === state.lastPage) {
					state.currentRecords = state.totalRecords - (state.pageSize * (state.currentPage - 1));
				}
				else {
					state.currentRecords = state.pageSize;
				}

				// now render
				this.$el.html( ( this.fallbackTemplate( state ) ) );
			}

			return this;
		},

		previous: function() {
			if(this.collection.hasPreviousPage()) {
				this.collection.getPreviousPage();
			}
			return false;
		},

		next: function() {
			if(this.collection.hasNextPage()) {
				this.collection.getNextPage();
			}
			return false;
		},

		sync: function() {
			this.collection.serverSync();
			return false;
		},

		destroy: function() {
			this.collection.clear(); // clear the collection
			Settings.set( 'last_update', null ); // clear the last update time
			this.collection.fetch(); // re-init the database with 0 records
			return false;
		},
	});

	return ProductPagination;
});
	