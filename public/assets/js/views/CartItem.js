define(['jquery', 'underscore', 'backbone', 'accounting', 'autoGrowInput', 'collections/CartItems'], 
	function($, _, Backbone, accounting, autoGrowInput, CartItems) {

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

		initialize: function() {

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
			CartItems.remove( this.model );
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

		displayLinePrice: function() {
			var price = parseFloat( this.model.get('price') ),
				tax = 0;

			// if cart item is taxable, get tax
			if( this.model.get('taxable') ) { tax = parseFloat( this.model.get('taxes.total') ); } 

			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
				price = price + tax;
			}

			else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
				price = price - tax;
			}

			return price;
		},

		/**
		 * Display the line total
		 * @param  {object} collection 	the cart items
		 * @return {float} subtotal
		 */
		displayLineTotal: function() {
			var price = parseFloat( this.model.get('price') ),
				qty = parseFloat( this.model.get('qty') ),
				total = 0,
				tax = 0;

			if( this.model.get('taxable') ) { tax = parseFloat( this.model.get('taxes.total') ); } 

			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl'  ) {
				total = ( price + tax ) * qty;
			}

			else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl'  ) {
				total = ( price - tax ) * qty;
			}

			else {
				total = price * qty;
			}

			return total;

		},

				/**
		 * Calculate discount (original price - new price)
		 * @param  {float} price 	the original price
		 * @param  {object}	model	the product 
		 * @return {float} discount 
		 */
		calcLineDiscount: function(newprice, model) {
			var original = parseFloat( model.get('price') ),
				tax = 0,
				discount = 0;

			// if cart item is taxable, get tax
			if( model.get('taxable') ) { tax = parseFloat( model.get('taxes.total') ); } 

			if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'no' && wc.tax_display_cart === 'incl' ) {
				discount = original + tax - newprice;
			}

			else if( wc.calc_taxes === 'yes' && wc.prices_include_tax === 'yes' && wc.tax_display_cart === 'excl' ) {
				discount = original - tax - newprice;
			}

			else {
				discount = original - newprice;
			}

			// round discount if required
			if( wc.round_at_subtotal === 'no' ) {
				discount = accounting.formatNumber(discount);
			}

			return discount;
		},

	});

  return CartItem;
});