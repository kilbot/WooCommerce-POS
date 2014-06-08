define(['underscore', 'backbone', 'accounting', 'views/Checkout', 'handlebars', 'selectText', 'views/Helpers'], 
	function(_, Backbone, accounting, Checkout, Handlebars, selectText) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		template: Handlebars.compile( $('#tmpl-cart-total').html() ),
		events: {
			'click .actions'			: 'cartActions',
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

			return this;
		},

		cartActions: function(e) {

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

					// pick the data from the cart items we are going to send
					var items = this.cart.map( function( model ) {
						return _.pick( model.toJSON(), ['id', 'qty', 'line_total'] );  
					});

					// init new checkout
					var checkout = new Checkout({ cart: this.cart, totals: this.model });
					checkout.process(items);
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