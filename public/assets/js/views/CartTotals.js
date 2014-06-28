define(['underscore', 'backbone', 'accounting', 'views/Checkout', 'handlebars', 'selectText', 'select2', 'views/Helpers'], 
	function(_, Backbone, accounting, Checkout, Handlebars, selectText, select2) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		template: Handlebars.compile( $('#tmpl-cart-total').html() ),
		events: {
			'click .actions'			: 'actions',
			'click .note' 				: 'edit',
			'click .order-discount' 	: 'edit',
			'keypress .note'			: 'saveOnEnter',
			'keypress .order-discount'	: 'saveOnEnter',
			'blur .note'				: 'save',
			'blur .order-discount'		: 'save',
			'change #select-customer'	: 'save'
		},
		params: pos_params,

		initialize: function( options ) {

			// pass pubsub to subviews
			this.pubSub = options.pubSub;

			// set the accounting settings
			accounting.settings = this.params.accounting;

			// use the cart already initialized
			this.cart = options.cart;

			// re-render on all changes to the totals model
			this.listenTo( this.model, 'change sync', this.render );
		},

		render: function() {

			// clear #cart-totals to start
			this.$el.removeClass('empty').html('');

			// render the totals
			this.$el.html( ( this.template( this.model.toJSON() ) ) );

			// add select2 to select_customer
			var self = this;
			this.$('#select-customer').select2({
    			minimumInputLength: 2,
    			ajax: {
    				url: pos_params.ajax_url,
    				dataType: 'json',
    				data: function( term, page ) {
    					return {
    						term: term,
    						action: 'pos_json_search_customers',
							security: this.data('nonce')
    					};
    				},
    				results: function( data, page, query ) {
    					var customers = [];
    					_( data ).each( function( obj, id ) {
    						customers.push( obj );
    					});
    					return { results: customers };
    				}
    			},
    			formatResult: self.formatResult,
    			formatSelection: self.formatSelection,
    			formatNoMatches: function( term ) { return self.params.select.no_matches; },
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

		formatResult: function( customer, container, query ) {
			var output = '';
			if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
			if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
			if( output === '' ) { output = customer.display_name + ' '; }
			if( ! _.isEmpty( customer.user_email ) ) { output += '(' + customer.user_email + ')'; }
			return output;
		},

		formatSelection: function( customer, container ) {
			var output = '';
			if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
			if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
			if( output === '' ) { output = customer.display_name; }
			return output;
		},

		actions: function(e) {

			// only interested in button clicks
			// if( !$(e.target).is('button') ) { return; }

			var action = e.target.className.match(/\saction-([a-z]+)/);
			var td;

			if( !action ) { return; }

			switch( action[1] ) {
				case 'void':
					// clear cart
					_.invoke(this.cart.toArray(), 'destroy');
				break;
				case 'note':
					// toggle note row
					td = this.$('.note').show().children('td');
					td.attr('contenteditable','true').focus();
				break;
				case 'discount':
					// toggle discount row
					td = this.$('.order-discount').show().children('td');
					td.attr('contenteditable','true').text( td.data('value') ).selectText();
				break;
				case 'checkout':
					// disable the checkout button while processing
					$(e.target).attr('disabled','disabled');
					$('#cart .actions').addClass('working');

					// init new checkout
					var checkout = new Checkout({ cart: this.cart, totals: this.model, pubSub: this.pubSub  });
				break;
			}
		},

		edit: function(e) {

			var className = e.currentTarget.className;
			if( !className ) { return; }

			switch( className ) {
				case 'note':
					$(e.currentTarget).children('td').attr('contenteditable','true').focus();
				break;
				case 'order-discount':
					var td = $(e.currentTarget).children('td');
					td.attr('contenteditable','true').text( td.data('value') ).selectText();
				break;
			}
		},

		save: function(e) {
			var el 		= $(e.target), 
				action 	= el.closest('tr').attr('class'), 
				value;

			// bail if no className
			if( !action ) { return; }

			switch( action ) {
				case 'note':
					value 	= el.text();

					// validate and save
					this.model.save({ note: value });

				break;
				case 'order-discount':
					value 	= el.text();

					// if empty, go back to zero
					if( value === '' ) { value = 0; } 

					// unformat number
					var decimal = accounting.unformat( value, accounting.settings.number.decimal );

					// validate
					if( isNaN( parseFloat( decimal ) ) ) {
						$(e.target).focus(); 
						return;
					}

					// save
					this.model.save({ order_discount: decimal });
				break;
				case 'customer':
					var id 		= e.added.id,
						name 	= this.formatSelection( e.added );

					// save
					this.model.save({ customer_id: id, customer_name: name });
				break;
			}
		},

		saveOnEnter: function(e) {

			// save note on enter
			if (e.which === 13) { 
				e.preventDefault();
				$(e.currentTarget).children('td').blur();
			}
		},

	});

	return CartTotalsView;
});