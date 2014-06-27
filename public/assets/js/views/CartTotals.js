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
			'blur .order-discount'		: 'save'
		},
		params: pos_params,

		initialize: function(options) {

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
			this.$('#select_customer').select2({
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
    					})
    					return { results: customers };
    				}
    			},
    			formatResult: function( customer, container, query ) {
    				var output = customer.first_name + ' ';
    				if( customer.last_name ) output += customer.last_name + ' ';
    				if( output === ' ' ) output = customer.display_name + ' ';
    				if( customer.user_email ) output += '(' + customer.user_email + ')';
    				return output;
    			},
    			formatSelection: function( customer, container ) {
    				var output = customer.first_name + ' ';
    				if( customer.last_name ) output += customer.last_name + ' ';
    				if( output === ' ' ) output = customer.display_name + ' ';
    				return output;
    			},
    			escapeMarkup: function(m) { return m; }
			});

			return this;
		},

		actions: function(e) {

			// only interested in button clicks
			// if( !$(e.target).is('button') ) { return; }

			var action = e.target.className.match(/\saction-([a-z]+)/);
			if( !action ) { return; }

			switch( action[1] ) {
				case 'void':
					// clear cart
					_.invoke(this.cart.toArray(), 'destroy');
				break;
				case 'note':
					// toggle note row
					var td = this.$('.note').show().children('td');
					td.attr('contenteditable','true').focus();
				break;
				case 'discount':
					// toggle discount row
					var td = this.$('.order-discount').show().children('td');
					td.attr('contenteditable','true').text( td.data('value') ).selectText();
				break;
				case 'checkout':
					// disable the checkout button while processing
					$(e.target).attr('disabled','disabled');
					$('#cart .actions').addClass('working');

					// init new checkout
					var checkout = new Checkout({ cart: this.cart, totals: this.model });
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
			var className 	= e.currentTarget.className,
				value 		= $(e.target).text();

			// bail if no className
			if( !className ) { return; }

			switch( className ) {
				case 'note':
					
					// validate and save
					this.model.save({ note: value });
				break;
				case 'order-discount':

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