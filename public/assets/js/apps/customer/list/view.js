define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CustomerApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-users-layout',

			regions: {
				filterRegion: '#users-filter',
				tabsRegion: '#users-tabs',
				productsRegion: '#users',
				paginationRegion: '#users-pagination'
			},

		});

		/**
		 * User Collection
		 */
		var NoUsersView = Marionette.ItemView.extend({
			tagName: 'li',
			template: '#tmpl-users-empty',
		});

		View.Users = Marionette.CollectionView.extend({
			tagName: 'ul',
			className: 'list',
			childView: View.User,
			emptyView: NoUsersView,

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
			},

		});

		/**
		 * Pagination
		 * TODO: store pagination and last update time in a viewModel?
		 */
		View.Pagination = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-pagination').html() ),

			initialize: function() {
				// this.on('all', function(e) { console.log("Pagination View event: " + e); }); // debug

			},

			triggers: {
				'click a.sync'		: 'pagination:sync:clicked',
				'click a.destroy'	: 'pagination:clear:clicked',
			},

			events: {
				'click a.prev'		: 'previous',
				'click a.next'		: 'next',
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

		View.DownloadProgress = Marionette.ItemView.extend({

			initialize: function (options) {
				var self = this;
				this.total = options.total;

				if(POS.debug) console.log('fetching modal download progress template');

				$.when( this.fetchTemplate( options.data ) )
				.done( function( data ) {
					self.template = _.template(data);
					self.trigger('modal:open', self.showProgressBar );
				})
				.fail( function() {
					if(POS.debug) console.warn('problem fetching download progress template');
				});
			},

			serializeData: function(){
				return { total : this.total };
			},

			behaviors: {
				Modal: {

				}
			},

			events: {
				'click .btn-primary' : 'confirm',
				'click .btn-default' : 'cancel',
				'click .close' 		 : 'cancel'
			},

			confirm: function () {
				this.trigger('modal:close');
			},

			cancel: function () {
				this.trigger('modal:close');
			},

			fetchTemplate: function(data) {
				return $.get(
					pos_params.ajax_url , {
						action: 'pos_get_modal',
						template: 'download-progress',
						data: data,
						security: pos_params.nonce
					}
				);
			},

			showProgressBar: function(args) {
				var el = args.view.content.$el.find('.progress');
				var progressBar = POS.Components.ProgressBar.channel.request( 'get:progressbar', { el: el } );
				progressBar.model.set({ max: el.data('total'), progress: 0, display: 'fraction' });

				this.listenTo( progressBar.model, 'progress:complete', function() {
					args.view.content.$el.find('.modal-footer').show();
				});

				progressBar.render();
			}

		});

		View.CartComponent = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-customer').html() ),

			initialize: function(options) {

			},

			behaviors: {
				Select2: {
					ajax: {
						url: pos_params.ajax_url,
						dataType: 'json',
						data: function( term ) {
	    					return {
	    						term: term,
	    						action: 'pos_json_search_customers',
								security: this.data('nonce')
	    					};
	    				},
	    				results: function( data ) {
	    					var customers = [];
	    					_( data ).each( function( obj ) {
	    						customers.push( obj );
	    					});
	    					return { results: customers };
	    				}
					},
					initSelection: function( element, callback ) {
	    				var data = { id: element.val(), display_name: element.data('customer') };
						callback( data );
	    			},
				}
			},

			events: {
				'change #select-customer' : 'updateCustomer',
        'click #add-customer' : 'addCustomer'
			},

      addCustomer: function(e) {
        data = {
          name: $('#add-customer-name').val(),
          email: $('#add-customer-email').val()
        };
        $.post(
          pos_params.ajax_url,
          {
            action: 'pos_add_customer',
            data: data,
            security: pos_params.nonce
          },
          function(response){
            if(response.error)
              alert(response.error);
            else {
              $('#add-customer-name').val('');
              $('#add-customer-email').val('');
              $('#select-customer').select2('data', {
                id: response.ID,
                display_name: response.data.display_name
              });
            }
          }
        );
      },

			updateCustomer: function(e) {
				this.trigger( 'customer:select', e.added.id, this.formatSelection( e.added ) );
			},

			formatResult: function( customer ) {
				var output = '';
				if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
				if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
				if( output === '' ) { output = customer.display_name + ' '; }
				if( ! _.isEmpty( customer.user_email ) ) { output += '(' + customer.user_email + ')'; }
				return output;
			},

			formatSelection: function( customer ) {
				var output = '';
				if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
				if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
				if( output === '' ) { output = customer.display_name; }
				return output;
			},

		});


	});

	return POS.CustomerApp.List.View;

});
