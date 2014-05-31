define(['jquery', 'underscore', 'backbone', 'accounting', 'autoGrowInput'], 
	function($, _, Backbone, accounting, autoGrowInput) {

	accounting.settings = pos_params.accounting.settings;
	var wc = pos_params.wc;

	// view holds individual cart items
	var CartItem = Backbone.View.extend({
		tagName : 'tr',
		template: _.template($('#tmpl-cart-item').html()),

		events: {
			"click .remove a"	: "removeFromCart",
			"click input"  		: "change",
			"keypress input"  	: "updateOnEnter",
      		"blur input"      	: "close"
		},

		initialize: function(options) {

			// use the cart already initialized
			this.cart = options.cart;

			// listen for changes to CartItem model
			this.listenTo( this.model, 'change', this.render );
		},

		render: function() {

			// grab the model
			var item = this.model.toJSON();

			// format display price, just in case
			item.display_price = accounting.formatNumber( item.display_price );

			// add discounted if required
			if( item.total_discount !== 0 ) {
				item.discounted = accounting.formatMoney( parseFloat(item.display_total) - item.total_discount );
			}
			
			// format display total
			item.display_total = accounting.formatMoney( item.display_total );

			// add 'ex. tax' if necessary
			// if( wc.tax_display_cart === 'excl') {
			// 	item.total = item.total + ' <small>(ex. tax)</small>';
			// }

			// render the single cart item
			this.$el.html( ( this.template( item ) ) );

			// add a function to autosize the Qty & Price inputs
			this.$('input[type=number]').autoGrowInput();

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
			var input 	= $(e.target);
			var key 	= input.data('id');
			var value 	= parseFloat(input.val()); // sanitise input

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
					if( value ) {
						this.model.set( { display_price: value } );
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