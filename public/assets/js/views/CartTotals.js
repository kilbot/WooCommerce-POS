define(['underscore', 'backbone', 'views/Checkout', 'accounting'], 
	function(_, Backbone, Checkout, accounting) {

	// the view containing all the totals, and the action buttons
	var CartTotalsView = Backbone.View.extend({
		el: $('#cart-totals'),
		template: _.template($('#tmpl-cart-total').html()),
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

			// grab the model
			var totals = this.model.toJSON();

			totals.subtotal 		= accounting.formatMoney( totals.subtotal );
			totals.cart_discount 	= accounting.formatMoney( totals.cart_discount * -1 );
			totals.tax 				= accounting.formatMoney( totals.tax );
			totals.total 			= accounting.formatMoney( totals.total );
			totals.order_discount 	= accounting.formatMoney( totals.order_discount * -1 );

			// render the totals
			this.$el.html( ( this.template( totals ) ) );

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
					var visible = this.$('.note').toggle().is(':visible');
					if( visible ) {
						this.$('.note').children('td').attr('contenteditable','true').focus();
					} else {
						this.$('.note').children('td').blur();
					}
				break;
				case 'discount':
					// toggle discount row
					var visible = this.$('.order-discount').toggle().is(':visible');
					if( visible ) {
						this.$('.order-discount').children('td').attr('contenteditable','true').focus();
					} else {
						this.$('.order-discount').children('td').blur();
					}
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
			$(e.currentTarget).children('td').attr('contenteditable','true').focus();
		},

		saveOnEnter: function(e) {

			// save note on enter
			if (e.which === 13) { 
				e.preventDefault();
				$(e.currentTarget).children('td').blur();
			}
		},

		save: function(e) {

			var className = e.currentTarget.className;
   			if( !className ) { return; }

   			var value = $(e.target).text();

   			switch( className ) {
   				case 'note':
   					
   					// validate and save
					this.model.save({ note: value });
   				break;
   				case 'order-discount':

   					value = parseFloat(value);
   					if( isNaN( value ) ) { $(e.target).focus(); return; }

   					// validate and save
   					if(value === '') {
   						$(e.currentTarget).hide();
   					} else {
   						this.model.save({ order_discount: value });
   					}
   				break;
   			}
		},

	});

	return CartTotalsView;
});