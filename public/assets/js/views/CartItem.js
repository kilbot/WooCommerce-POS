define(['jquery', 'underscore', 'backbone', 'accounting', 'autoGrowInput'], 
	function($, _, Backbone, accounting, autoGrowInput) {

	// view holds individual cart items
	var CartItem = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-cart-item').html()),
		params: pos_params,

		events: {
			"click .remove a"	: "removeFromCart",
			"click input"  		: "change",
			"keypress input"  	: "updateOnEnter",
      		"blur input"      	: "close"
		},

		initialize: function(options) {

			// set the accounting settings
			accounting.settings = this.params.accounting;

			// use the cart already initialized
			this.cart = options.cart;

			// listen for changes to CartItem model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();
			var total = accounting.unformat( item.display_total, accounting.settings.number.decimal );

			// add discounted if required
			if( item.total_discount !== 0 ) {
				item.discounted = accounting.formatMoney( total - item.total_discount );
			}

			item.display_total = accounting.formatMoney( total );

			// add 'ex. tax' if necessary
			// if( wc.tax_display_cart === 'excl') {
			// 	item.total = item.total + ' <small>(ex. tax)</small>';
			// }

			// render the single cart item
			this.$el.html( ( this.template( item ) ) );

			// add a function to autosize the Qty & Price inputs
			this.$('input').autoGrowInput();

			return this;
		},

		removeFromCart: function(e) {
			if( typeof e !== 'undefined' ) { e.preventDefault(); }
			this.$el.fadeOut(200, function(){
				$(this).remove();
			});
			this.model.destroy();
			// this.cart.remove( this.model );
		},

		change: function(e) {
			 this.$(e.target).addClass('editing').focus().select();
		},

		close: function(e) {
			var input 	= $(e.target),
				key 	= input.data('id'),
				value 	= input.val(),
				decimal = accounting.unformat( value, accounting.settings.number.decimal );

			switch( key ) {
				case 'qty':
					if ( value === this.model.get('qty') ) { break; }
					if ( value === 0 ) {
						this.removeFromCart();
						break;
					}
					if ( value ) {
						this.model.set( { qty: value } );
						input.removeClass('editing');
					} else {
						input.focus();
					}
					break;

				case 'price':
					if( !isNaN( decimal ) ) {
						value = accounting.formatNumber( decimal );
						this.model.save( { display_price: value } );
					} else {
						input.focus();
					}
					break;		
			}
		},

		updateOnEnter: function(e) {

			// enter key triggers blur as well?
			if (e.keyCode === 13) { this.close(e); }
		},

	});

  return CartItem;
});