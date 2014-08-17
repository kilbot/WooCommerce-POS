define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CustomerApp.List.View', function(View, POS, Backbone, Marionette, $, _){

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
				'change #select-customer' : 'updateCustomer'
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