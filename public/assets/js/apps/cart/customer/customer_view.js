define(['app', 'handlebars', 'select2'], function(POS, Handlebars){

	POS.module('CartApp.Customer.View', function(View, POS, Backbone, Marionette, $, _){

		View.Customer = Marionette.ItemView.extend({
			template: _.template( $('#tmpl-cart-customer').html() ),

			onRender: function() {

				// add select2 to select_customer
				var self = this;
				this.$('#select-customer').select2({
	    			minimumInputLength: 2,
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
	    			formatResult: self.formatResult,
	    			formatSelection: self.formatSelection,
	    			formatNoMatches: function() { return self.params.select.no_matches; },
	    			formatSearching: function() { return self.params.select.searching; },
	    			formatInputTooShort: function( input, min ) { 
	    				var n = min - input.length; 
	    				if( n > 1 ) {
	    					var str = self.params.select.too_shorts;
	    					return str.replace( "%d", n );
	    				} else {
	    					return self.params.select.too_short;
	    				}
	    			},
	    			formatInputTooLong: function( input, max ) { 
	    				var n = input.length - max; 
	    				if( n > 1 ) {
	    					var str = self.params.select.too_longs;
	    					return str.replace( "%d", n );
	    				} else {
	    					return self.params.select.too_long;
	    				}
	    			},
	    			formatSelectionTooBig: function( limit ) {
	    				if( limit > 1 ) {
	    					var str = self.params.select.too_bigs;
	    					return str.replace( "%d", limit );
	    				} else {
	    					return self.params.select.too_big;
	    				}
	    			},
	    			formatLoadMore: function() { return self.params.select.load_more; },
	    			initSelection: function( element, callback ) {
	    				var data = { id: element.val(), display_name: element.data('customer') };
						callback( data );
	    			},
				});

				return this;
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

	return POS.CartApp.Customer.View;
});